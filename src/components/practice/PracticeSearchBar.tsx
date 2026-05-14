import { useAppTheme } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
};

export function PracticeSearchBar({ value, onChangeText, onClear }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: value ? colors.inputFocusedBorder : colors.inputBorder,
        borderRadius: 20,
        paddingHorizontal: 14,
        height: 54,
      }}
    >
      <Ionicons name="search" size={20} color={colors.mutedText} />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Egzersiz ara..."
        placeholderTextColor={colors.inputPlaceholder}
        style={{
          flex: 1,
          color: colors.text,
          fontSize: 15,
          fontWeight: "700",
          paddingVertical: 0,
        }}
      />

      {value.length > 0 ? (
        <Pressable
          onPress={onClear}
          hitSlop={8}
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="close" size={17} color={colors.mutedText} />
        </Pressable>
      ) : null}
    </View>
  );
}