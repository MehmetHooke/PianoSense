// app\(teacher)\classes.tsx
import { AuthGate } from "@/src/components/auth/AuthGate";
import { TeacherClassAccordion, teacherClassAccordionTransition } from "@/src/components/teacher/TeacherClassAccordion";
import { useAuth } from "@/src/context/AuthContext";
import { useAppAlert } from "@/src/hooks/useAppAlert";
import {
  createClass,
  deleteClass,
  listenTeacherClasses,
} from "@/src/services/classroomService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { ClassStudent, TeacherClass } from "@/src/types/classroom";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import Animated from "react-native-reanimated";

export default function TeacherClassesScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { showAlert, hideAlert } = useAppAlert();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [className, setClassName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setClasses([]);
      return;
    }

    const unsubscribe = listenTeacherClasses(
      user.uid,
      setClasses,
      (error) => {
        console.log("TEACHER CLASSES LISTEN ERROR:", error);
        setErrorMessage("Sınıflar yüklenemedi.");
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  async function handleCreateClass() {
    if (!user?.uid || isCreating) return;

    const name = className.trim();

    if (!name) {
      setErrorMessage("Lütfen sınıf adı gir.");
      return;
    }

    try {
      setErrorMessage("");
      setIsCreating(true);

      await createClass({
        teacherId: user.uid,
        name,
      });

      setClassName("");
    } catch (error: any) {
      console.log("CREATE CLASS ERROR:", error);
      setErrorMessage(error?.message ?? "Sınıf oluşturulamadı.");
    } finally {
      setIsCreating(false);
    }
  }

  async function copyJoinCode(joinCode: string) {
    await Clipboard.setStringAsync(joinCode);
    showAlert({
      type: "info",
      title: "Kod kopyalandı",
      message: "Sınıf katılım kodu panoya kopyalandı."
    });
  }

  function requestDeleteClass(classItem: TeacherClass) {
    if (deletingClassId) return;

    showAlert({
      type: "warning",
      title: "Sınıf silinsin mi?",
      message: `"${classItem.name}" sınıfı öğretmen panelinden kaldırılacak. Bu işlemden emin misin?`,
      primaryActionLabel: "Sınıfı sil",
      onPrimaryAction: () => {
        hideAlert();
        void confirmDeleteClass(classItem);
      },
    });
  }

  async function confirmDeleteClass(classItem: TeacherClass) {
    if (!user?.uid || deletingClassId) return;

    try {
      setDeletingClassId(classItem.id);

      await deleteClass({
        teacherId: user.uid,
        classId: classItem.id,
      });

      setExpandedClassId((current) =>
        current === classItem.id ? null : current,
      );

      showAlert({
        type: "success",
        title: "Sınıf silindi",
        message: `"${classItem.name}" artık sınıflar listende görünmeyecek.`,
      });
    } catch (error: any) {
      console.log("DELETE CLASS ERROR:", error);

      showAlert({
        type: "error",
        title: "Sınıf silinemedi",
        message: error?.message ?? "Bir sorun oluştu. Lütfen tekrar dene.",
      });
    } finally {
      setDeletingClassId(null);
    }
  }

  function openStudent(student: ClassStudent) {
    router.push({
      pathname: "/student/[studentId]",
      params: {
        studentId: student.studentId,
        name: student.name,
        surname: student.surname,
        displayName: student.displayName,
        studentCode: student.studentCode,
      },
    });
  }

  return (
    <AuthGate>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 60,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 30,
                fontWeight: "900",
                letterSpacing: -0.8,
              }}
            >
              Sınıflar
            </Text>

            <Text
              style={{
                marginTop: 6,
                color: colors.mutedText,
                fontSize: 14,
                fontWeight: "600",
                lineHeight: 20,
              }}
            >
              Öğrencilerini sınıflara ayırarak takip et.
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 24,
            backgroundColor: colors.card,
            borderRadius: 26,
            padding: 18,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "900",
            }}
          >
            Yeni sınıf oluştur
          </Text>

          <Text
            style={{
              marginTop: 6,
              color: colors.mutedText,
              fontSize: 13,
              fontWeight: "600",
              lineHeight: 19,
            }}
          >
            Sınıf oluşturduğunda otomatik bir katılım kodu üretilecek.
          </Text>

          <View
            style={{
              marginTop: 14,
              flexDirection: "row",
              gap: 10,
            }}
          >
            <TextInput
              value={className}
              onChangeText={(value) => {
                setClassName(value);
                setErrorMessage("");
              }}
              placeholder="Örn: Cumartesi Piyano Grubu"
              placeholderTextColor={colors.subtleText}
              autoCorrect={false}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 18,
                paddingHorizontal: 16,
                backgroundColor: colors.surface,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.softBorder,
                fontSize: 14,
                fontWeight: "700",
              }}
            />

            <Pressable
              onPress={handleCreateClass}
              disabled={isCreating}
              style={({ pressed }) => ({
                minWidth: 54,
                height: 50,
                paddingHorizontal: 16,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.primary,
                opacity: pressed || isCreating ? 0.72 : 1,
              })}
            >
              {isCreating ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Ionicons
                  name="add"
                  size={24}
                  color={colors.primaryForeground}
                />
              )}
            </Pressable>
          </View>

          {errorMessage ? (
            <Text
              style={{
                marginTop: 12,
                color: colors.danger ?? colors.text,
                fontSize: 13,
                fontWeight: "700",
                lineHeight: 18,
              }}
            >
              {errorMessage}
            </Text>
          ) : null}
        </View>

        <Animated.View
          layout={teacherClassAccordionTransition}
          style={{
            marginTop: 20,
            backgroundColor: colors.card,
            borderRadius: 26,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "900",
            }}
          >
            Sınıflarım
          </Text>

          {classes.length === 0 ? (
            <Text
              style={{
                marginTop: 8,
                color: colors.mutedText,
                fontSize: 14,
                fontWeight: "600",
                lineHeight: 20,
              }}
            >
              Henüz sınıf yok. İlk sınıfını oluşturduğunda burada katılım kodu,
              öğrenci listesi ve sınıf özeti görünecek.
            </Text>
          ) : (
            <View style={{ marginTop: 14, gap: 12 }}>
              {classes.map((classItem) => (
                <TeacherClassAccordion
                  key={classItem.id}
                  classItem={classItem}
                  expanded={expandedClassId === classItem.id}
                  onPress={() =>
                    setExpandedClassId((current) =>
                      current === classItem.id ? null : classItem.id,
                    )
                  }
                  onCopyJoinCode={copyJoinCode}
                  onOpenStudent={openStudent}
                  onDeleteClass={requestDeleteClass}
                  isDeleting={deletingClassId === classItem.id}
                  colors={colors}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </AuthGate>
  );
}