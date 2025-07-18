import { t } from 'i18next';
import React, { Dispatch, RefObject, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, DimensionValue, Pressable } from 'react-native'
import { LineChart, lineDataItem } from "react-native-gifted-charts";
import { bellCurve, bellCurveInt, range } from '~/lib/math';
import Slider from '@react-native-community/slider';
import { useAuth } from '~/lib/auth';
import { Button } from '~/components/ui/button';
import { router } from 'expo-router';
import { useOnboard } from './_layout';
import { useColorScheme } from '~/lib/useColorScheme';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function OnboardingStats() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDarkColorScheme } = useColorScheme();

  const { stats: oStats, setStats } = useOnboard();

  const [discipline, setDiscipline] = useState(oStats?.discipline || 50);
  const [physical, setPhysical] = useState(oStats?.physical || 50);
  const [mental, setMental] = useState(oStats?.mental || 50);
  const [social, setSocial] = useState(oStats?.social || 50);
  const [spiritual, setSpiritual] = useState(oStats?.spiritual || 50);
  const [skill, setSkill] = useState(oStats?.skill || 50);

  const widthRef = useRef<View>(null);
  const [width, setWidth] = useState<number>(600);
  useEffect(() => {
    if (widthRef.current) {
      widthRef.current.measure((x, y, w, h, px, py) => {
        setWidth(w);
      });
    }
  }, [widthRef]);

  const [index, setIndex] = useState(0);
  const scrolLViewRef = useRef<ScrollView>(null);
  useEffect(() => {
    if (scrolLViewRef.current) {
      scrolLViewRef.current.scrollTo({ x: index * width, animated: true });
    }
  }, [index, width]);

  const handleNext = () => {
    if (!user) return;

    const avgStat = (discipline + physical + mental + social + spiritual + skill) / 6;

    setStats({
      uid: user.id,
      lastUpdated: Math.floor(Date.now() / 1000),
      discipline,
      physical,
      mental,
      social,
      spiritual,
      skill,
      xp: 0,
      level: Math.floor(((avgStat) - 40) / 10) + 5,
      gold: 0,
      gems: 0
    });

    router.push('/onboarding/final');
  };

  return (
    <View className="px-8 h-full justify-center">
      <Text className="text-foreground text-center font-bold text-3xl mb-1">{t("statsTitle")}</Text>
      <Text className="text-foreground text-center mb-4">{t("statsDescription")}</Text>

      <Text className="text-foreground text-center">{t("bellCurveTitle")}</Text>
      <View className='w-full' ref={widthRef}>
        <ScrollView
          className='w-full'
          horizontal
          scrollEnabled={false}
          ref={scrolLViewRef}
        >
          <BellCurve statname="discipline" slider={discipline} setSlider={setDiscipline} width={width} />
          <BellCurve statname="physical" slider={physical} setSlider={setPhysical} width={width} />
          <BellCurve statname="mental" slider={mental} setSlider={setMental} width={width} />
          <BellCurve statname="social" slider={social} setSlider={setSocial} width={width} />
          <BellCurve statname="spiritual" slider={spiritual} setSlider={setSpiritual} width={width} />
          <BellCurve statname="skill" slider={skill} setSlider={setSkill} width={width} />
        </ScrollView>

        <View className='flex-row justify-between mt-4 w-[60%] items-center mx-auto'>
          <ChevronLeft
            color={isDarkColorScheme ? 'white' : '#f3b720'}
            onPress={() => setIndex((prev) => (prev > 0 ? prev - 1 : 5))}
            strokeWidth={3}
            size={24}
          />
          <Pressable
            className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-secondary' : 'bg-foreground'}`}
            onPress={() => setIndex(0)}
          />
          <Pressable
            className={`w-4 h-4 rounded-full ${index === 1 ? 'bg-secondary' : 'bg-foreground'}`}
            onPress={() => setIndex(1)}
          />
          <Pressable
            className={`w-4 h-4 rounded-full ${index === 2 ? 'bg-secondary' : 'bg-foreground'}`}
            onPress={() => setIndex(2)}
          />
          <Pressable
            className={`w-4 h-4 rounded-full ${index === 3 ? 'bg-secondary' : 'bg-foreground'}`}
            onPress={() => setIndex(3)}
          />
          <Pressable
            className={`w-4 h-4 rounded-full ${index === 4 ? 'bg-secondary' : 'bg-foreground'}`}
            onPress={() => setIndex(4)}
          />
          <Pressable
            className={`w-4 h-4 rounded-full ${index === 5 ? 'bg-secondary' : 'bg-foreground'}`}
            onPress={() => setIndex(5)}
          />
          <ChevronRight
            color={isDarkColorScheme ? 'white' : '#f3b720'}
            onPress={() => setIndex((prev) => (prev < 5 ? prev + 1 : 0))}
            strokeWidth={3}
            size={24}
          />
        </View>
      </View>

      <Button className="bg-secondary mx-6 mt-8" onPress={handleNext}><Text className="text-white text-xl font-bold">{t("next")}</Text></Button>
    </View>
  )
}

interface BellCurveProps {
  statname: "discipline" | "physical" | "mental" | "social" | "spiritual" | "skill",
  slider: number,
  setSlider: Dispatch<SetStateAction<number>>,
  width: DimensionValue,
}

const BellCurve = (props: BellCurveProps) => {
  const { t } = useTranslation();
  const { isDarkColorScheme } = useColorScheme();

  const bellCurveData = useMemo(() => range(0, 101).map<lineDataItem>((x) => {
    const value = bellCurve(x) * 10;
    if (x !== props.slider) return { value, hideDataPoint: true };

    const percentage = bellCurveInt(0, x);

    const cdp = () => (
      <View
        style={{
          width: 20,
          height: 20,
          backgroundColor: 'white',
          borderWidth: 4,
          borderRadius: 10,
          borderColor: '#f3b720',
        }}
      />
    );

    return {
      value,
      customDataPoint: cdp,
      dataPointLabelWidth: 100,
      dataPointLabelShiftY: -15,
      dataPointLabelShiftX: 8,
      dataPointText: t("topperc").replace("{{percent}}", (100 - percentage).toFixed(2)),
      textFontSize: 14,
      textShiftX: -15,
      textShiftY: -5,
      showVerticalLine: true,
      verticalLineUptoDataPoint: true,
      verticalLineColor: '#f3b720',
      labelComponent: () => (
        <View className='w-6'>
          <Text className='text-white text-left font-bold -ml-2'>{x}</Text>
        </View>
      ),
    }
  }), [props.slider]);

  return (
    <View
      style={{
        width: props.width,
      }}
    >
      <Text className='text-foreground text-center text-2xl font-bold underline'>
        {t(props.statname).toUpperCase()}
      </Text>

      <LineChart
        thickness={6}
        color="#f3b720"
        areaChart
        data={bellCurveData}
        curved
        startFillColor={'#f1ec6a'}
        endFillColor={'#f1ec6a'}
        startOpacity={0.4}
        endOpacity={0.4}
        spacing={3}
        yAxisSide={1}
        hideAxesAndRules
        dataPointsHeight={20}
        dataPointsWidth={20}
        disableScroll
        textColor1={isDarkColorScheme ? 'white' : 'black'}
      />

      <Slider
        minimumValue={0}
        maximumValue={100}
        value={props.slider}
        onValueChange={props.setSlider}
        step={1}
        minimumTrackTintColor='#f3b720'
      />
    </View>
  )
}