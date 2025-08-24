import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { RadarChart } from "react-native-gifted-charts";
import { useAuth } from "~/lib/auth";
import { useColorScheme } from "~/lib/useColorScheme";

export default function Tab() {
  const { stats } = useAuth();
  const { isDarkColorScheme } = useColorScheme();
  const { t } = useTranslation();

  return (
    <View>
      {/*TODO*/}
      <RadarChart
        data={[
          stats?.skill || 50,
          stats?.mental || 50,
          stats?.physical || 50,
          stats?.social || 50,
          stats?.spiritual || 50,
          stats?.discipline || 50,
        ]}
        labels={[t("skill"), t("mental"), t("physical"), t("social"), t("spiritual"), t("discipline")]}
        maxValue={100}
        labelConfig={{
          fontSize: 14,
          fontWeight: 'bold',
          stroke: isDarkColorScheme ? 'white' : 'black',
        }}
        labelsPositionOffset={4}
        polygonConfig={{
          fill: "#f1ec6a",
          showGradient: true,
          gradientColor: "#f1ec6a",
          gradientOpacity: 0.4,
          stroke: "#f3b720",
        }}
        gridConfig={{
          fill: "transparent",
          showGradient: false,
        }}
        chartSize={300}
      />
    </View>
  )
}
