import { listenClassStudents } from "@/src/services/classroomService";
import { ClassStudent, TeacherClass } from "@/src/types/classroom";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function TeacherClassCard({
  classItem,
  colors,
  onCopyJoinCode,
}: {
  classItem: TeacherClass;
  colors: any;
  onCopyJoinCode: (joinCode: string) => void;
}) {
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [studentsError, setStudentsError] = useState("");

  useEffect(() => {
    const unsubscribe = listenClassStudents(
      classItem.id,
      setStudents,
      (error) => {
        console.log("CLASS STUDENTS LISTEN ERROR:", error);
        setStudentsError("Öğrenciler yüklenemedi.");
      },
    );

    return unsubscribe;
  }, [classItem.id]);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.softBorder,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 17,
              fontWeight: "900",
            }}
            numberOfLines={1}
          >
            {classItem.name}
          </Text>

          <Text
            style={{
              marginTop: 5,
              color: colors.mutedText,
              fontSize: 13,
              fontWeight: "700",
            }}
          >
            {students.length} öğrenci
          </Text>
        </View>

        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 16,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="people-outline"
            size={21}
            color={colors.primary}
          />
        </View>
      </View>

      <Pressable
        onPress={() => onCopyJoinCode(classItem.joinCode)}
        style={({ pressed }) => ({
          marginTop: 14,
          backgroundColor: colors.card,
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

      <View
        style={{
          marginTop: 14,
          paddingTop: 14,
          borderTopWidth: 1,
          borderTopColor: colors.softBorder,
        }}
      >
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
                  backgroundColor: colors.card,
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
    </View>
  );
}