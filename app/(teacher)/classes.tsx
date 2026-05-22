import { AuthGate } from "@/src/components/auth/AuthGate";
import { SettingsSectionAccordion } from "@/src/components/settings/SettingsSectionAccordion";
import { useAuth } from "@/src/context/AuthContext";
import {
  createClass,
  listenClassStudents,
  listenTeacherClasses,
} from "@/src/services/classroomService";
import { useAppTheme } from "@/src/theme/useTheme";
import type { ClassStudent, TeacherClass } from "@/src/types/classroom";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function TeacherClassesScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [className, setClassName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

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
    Alert.alert("Kod kopyalandı", "Sınıf katılım kodu panoya kopyalandı.");
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

        <View
          style={{
            marginTop: 20,
            backgroundColor: colors.card,
            borderRadius: 26,
            padding: 20,
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
                <ClassAccordion
                  key={classItem.id}
                  classItem={classItem}
                  expanded={expandedClassId === classItem.id}
                  onPress={() =>
                    setExpandedClassId((current) =>
                      current === classItem.id ? null : classItem.id,
                    )
                  }
                  onCopyJoinCode={copyJoinCode}
                  colors={colors}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </AuthGate>
  );
}

function ClassAccordion({
  classItem,
  expanded,
  onPress,
  onCopyJoinCode,
  colors,
}: {
  classItem: TeacherClass;
  expanded: boolean;
  onPress: () => void;
  onCopyJoinCode: (joinCode: string) => void;
  colors: any;
}) {
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [studentsError, setStudentsError] = useState("");

  useEffect(() => {
    if (!expanded) return;

    const unsubscribe = listenClassStudents(
      classItem.id,
      setStudents,
      (error) => {
        console.log("CLASS STUDENTS LISTEN ERROR:", error);
        setStudentsError("Öğrenciler yüklenemedi.");
      },
    );

    return unsubscribe;
  }, [expanded, classItem.id]);

  const studentCount =
    typeof classItem.studentCount === "number"
      ? classItem.studentCount
      : students.length;

  return (
    <SettingsSectionAccordion
      title={classItem.name}
      description={`${studentCount} öğrenci`}
      iconName="people-outline"
      iconColor={colors.primary}
      iconBackgroundColor={colors.primarySoft}
      iconBorderColor={alpha(colors.primary, 0.18)}
      expanded={expanded}
      onPress={onPress}
      colors={colors}
    >
      <Pressable
        onPress={() => onCopyJoinCode(classItem.joinCode)}
        style={({ pressed }) => ({
          backgroundColor: colors.elevatedCard,
          borderRadius: 18,
          paddingVertical: 13,
          paddingHorizontal: 14,
          borderWidth: 1,
          borderColor: alpha(colors.primary, 0.18),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: pressed ? 0.84 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        })}
      >
        <View>
          <Text
            style={{
              color: colors.subtleText,
              fontSize: 11,
              fontWeight: "900",
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            Katılım Kodu
          </Text>

          <Text
            style={{
              color: colors.text,
              fontSize: 24,
              fontWeight: "900",
              letterSpacing: 3,
              marginTop: 2,
            }}
          >
            {classItem.joinCode}
          </Text>
        </View>

        <Ionicons name="copy-outline" size={20} color={colors.primary} />
      </Pressable>

      <View style={{ marginTop: 16 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 14,
            fontWeight: "900",
          }}
        >
          Öğrenciler
        </Text>

        {studentsError ? (
          <Text
            style={{
              marginTop: 8,
              color: colors.danger ?? colors.text,
              fontSize: 13,
              fontWeight: "700",
            }}
          >
            {studentsError}
          </Text>
        ) : students.length === 0 ? (
          <Text
            style={{
              marginTop: 8,
              color: colors.mutedText,
              fontSize: 13,
              fontWeight: "600",
              lineHeight: 19,
            }}
          >
            Bu sınıfa henüz öğrenci katılmadı.
          </Text>
        ) : (
          <View style={{ marginTop: 10, gap: 8 }}>
            {students.map((student) => (
              <View
                key={student.studentId}
                style={{
                  backgroundColor: colors.elevatedCard,
                  borderRadius: 16,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: colors.softBorder,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 14,
                    backgroundColor: colors.primarySoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 14,
                      fontWeight: "900",
                    }}
                  >
                    {(student.displayName || "Ö").charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 14,
                      fontWeight: "900",
                    }}
                    numberOfLines={1}
                  >
                    {student.displayName}
                  </Text>

                  <Text
                    style={{
                      color: colors.mutedText,
                      fontSize: 12,
                      fontWeight: "700",
                      marginTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    Kod: {student.studentCode}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </SettingsSectionAccordion>
  );
}