import { Text, View } from 'react-native';
import { useOnboard } from './_layout';
import { useTranslation } from 'react-i18next';
import { RadarChart } from 'react-native-gifted-charts';
import { useColorScheme } from '~/lib/useColorScheme';
import { Button } from '~/components/ui/button';

export default function OnboardingFinal() {
    const { username, pinfo, stats, finishOnboarding } = useOnboard();
    const { t } = useTranslation();
    const { isDarkColorScheme } = useColorScheme();

    return (
        <View className='h-full flex-col items-center justify-center px-8'>
            
            <View className='mb-8'>
                <Text className='text-3xl font-bold text-foreground text-center mb-4'>{t("finalTitle")}</Text>
                <Text className='text-lg font-semibold text-foreground text-left'>{`${t("username")}: ${username}`}</Text>
                <Text className='text-lg font-semibold text-foreground text-left'>{`${t("fullname")}: ${pinfo?.name}`}</Text>
                <Text className='text-lg font-semibold text-foreground text-left'>{`${t("age")}: ${pinfo?.age}`}</Text>
                <Text className='text-lg font-semibold text-foreground text-left'>{`${t("gender")}: ${t("" + pinfo?.gender)}`}</Text>
            </View>


            <Text className='text-lg font-semibold text-foreground text-center -mb-6'>{`${t("startingLevel")}: ${stats?.level || 1}`}</Text>

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

            <Button className="bg-secondary mx-6 mt-8 w-[80%]" onPress={finishOnboarding}><Text className="text-white text-xl font-bold">{t("done")}</Text></Button>
        </View>
    )
}
