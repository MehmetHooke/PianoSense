// src\components\teacher\TeacherClassAccordion.tsx
import {
  listenClassStudents,
} from "@/src/services/classroomService";
import type { ClassStudent, TeacherClass } from "@/src/types/classroom";
import { alpha } from "@/src/utils/color";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

type Props = {
  classItem: TeacherClass;
  expanded: boolean;
  onPress: () => void;
  onCopyJoinCode: (joinCode: string) => void;
  colors: any;
};

export const teacherClassAccordionTransition = LinearTransition.springify()
  .damping(45)
  .stiffness(200);

export function TeacherClassAccordion({
  classItem,
  expanded,
  onPress,
  onCopyJoinCode,
  colors,
}: Props) {
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

  const studentCount = classItem.studentCount ?? students.length ?? 0;

  return (
    <Animated.View
      layout={teacherClassAccordionTransition}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: expanded ? alpha(colors.primary, 0.22) : colors.softBorder,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          opacity: pressed ? 0.88 : 1,
        })}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 18,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="people-outline"
            size={23}
            color={colors.primary}
          />
        </View>

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
              marginTop: 4,
              color: colors.mutedText,
              fontSize: 13,
              fontWeight: "700",
            }}
            numberOfLines={1}
          >
            {studentCount} öğrenci
          </Text>
        </View>

        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 12,
            backgroundColor: expanded
              ? colors.primarySoft
              : colors.elevatedCard,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={17}
            color={expanded ? colors.primary : colors.mutedText}
          />
        </View>
      </Pressable>

      {expanded ? (
        <Animated.View
          layout={teacherClassAccordionTransition}
          style={{
            marginTop: 15,
            paddingTop: 15,
            borderTopWidth: 1,
            borderTopColor: colors.softBorder,
          }}
        >
          <Pressable
            onPress={() => onCopyJoinCode(classItem.joinCode)}
            style={({ pressed }) => ({
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

            <Ionicons
              name="copy-outline"
              size={20}
              color={colors.primary}
            />
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
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}