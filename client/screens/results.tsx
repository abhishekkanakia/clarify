import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStack';
import { ChevronLeft } from 'lucide-react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import Slider from '@react-native-community/slider';

type ResultsRouteProp = RouteProp<RootStackParamList, 'Results'>;

interface ResultsProps {
  route: ResultsRouteProp;
}

export default function Results({ route }: ResultsProps) {
  const { insights, fullText, recordingUri, subject } = route.params;
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadAudio = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: false }
      );
      setSound(newSound);
      
      // Get duration
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          if (status.error) {
            console.log('Playback error:', status.error);
          }
        } else {
          setPosition(status.positionMillis);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
          }
        }
      });
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  useEffect(() => {
    loadAudio();
  }, []);

  const playAudio = async () => {
    try {
      if (!sound) return;
      
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Could not play the audio');
    }
  };

  const handleSliderValueChange = async (value: number) => {
    if (!sound) return;
    await sound.setPositionAsync(value);
    setPosition(value);
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const Section = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: keyof typeof Feather.glyphMap;
    children: React.ReactNode;
  }) => (
    <View className="mb-6 rounded-xl bg-gray-50 p-6 dark:bg-[#1E1E1E]">
      <View className="mb-4 flex-row items-center">
        <Feather name={icon} size={20} color="#6366f1" className="mr-2" />
        <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</Text>
      </View>
      {children}
    </View>
  );

  const saveAudio = async () => {
    try {
      const audioData = {
        subject: subject,
        recordingUri: recordingUri,
        fullText: fullText,
        insights: insights,
      };

      const existingAudio = await AsyncStorage.getItem('audio');
      const audioList = existingAudio ? JSON.parse(existingAudio) : [];
      audioList.push(audioData);
      await AsyncStorage.setItem('audio', JSON.stringify(audioList));
      console.log('Audio saved successfully:', audioList);
      Alert.alert('Success', 'Audio saved successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (error) {
      console.error('Error saving audio:', error);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-16 dark:bg-[#121212]">
      {/* Header */}
      <View className="mb-8 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          className="rounded-full p-2">
          <ChevronLeft size={24} color="#6366f1" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100">Results</Text>
        <TouchableOpacity onPress={saveAudio} className="rounded-full p-2">
          <Feather name="save" size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Audio Player */}
      <View className="mb-6 rounded-xl bg-gray-50 p-4 dark:bg-[#1E1E1E]">
        <View className="flex-row items-center justify-center mb-3">
          <TouchableOpacity onPress={playAudio} className="p-2">
            <Feather 
              name={isPlaying ? 'pause' : 'play'} 
              size={24} 
              color="#6366f1" 
            />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(position)}
          </Text>
          <Slider
            style={{flex: 1, marginHorizontal: 10}}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onSlidingComplete={handleSliderValueChange}
            minimumTrackTintColor="#6366f1"
            maximumTrackTintColor="#d1d5db"
            thumbTintColor="#6366f1"
          />
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(duration)}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1">
        {/* Summary */}
        <Section title="Summary" icon="file-text">
          <Text
            selectable
            selectionColor="#6366f180"
            className="text-base text-gray-600 dark:text-gray-300">
            {insights?.summary || 'No summary available.'}
          </Text>
        </Section>

        {/* Key Points */}
        {insights?.key_points?.length > 0 && (
          <Section title="Key Points" icon="list">
            {insights.key_points.map((point: string, index: number) => (
              <Text key={index} className="mb-1 text-base text-gray-600 dark:text-gray-300">
                • {point}
              </Text>
            ))}
          </Section>
        )}

        {/* Test Questions */}
        {insights?.test_questions?.length > 0 && (
          <Section title="Potential Test Questions" icon="help-circle">
            {insights.test_questions.map((q: string, index: number) => (
              <Text key={index} className="mb-1 text-base text-gray-600 dark:text-gray-300">
                - {q}
              </Text>
            ))}
          </Section>
        )}

        {/* Glossary */}
        {insights?.glossary?.length > 0 && (
          <Section title="Glossary" icon="book-open">
            {insights.glossary.map((entry: { term: string; definition: string }, index: number) => (
              <View key={index} className="mb-2">
                <Text className="text-base font-semibold text-indigo-500 dark:text-indigo-400">
                  {entry.term}
                </Text>
                <Text className="text-base text-gray-600 dark:text-gray-300">
                  {entry.definition}
                </Text>
              </View>
            ))}
          </Section>
        )}

        {/* Lecture Structure */}
        {insights?.lecture_structure?.length > 0 && (
          <Section title="Lecture Structure" icon="clock">
            {insights.lecture_structure.map((line: string, index: number) => (
              <Text key={index} className="mb-1 text-base text-gray-600 dark:text-gray-300">
                {line}
              </Text>
            ))}
          </Section>
        )}

        {/* Action Items */}
        {insights?.action_items?.length > 0 && (
          <Section title="Action Items" icon="check-circle">
            {insights.action_items.map((item: string, index: number) => (
              <Text key={index} className="mb-1 text-base text-gray-600 dark:text-gray-300">
                • {item}
              </Text>
            ))}
          </Section>
        )}

        {/* Study Plan */}
        {insights?.study_plan && (
          <Section title="Study Plan" icon="calendar">
            {Object.entries(insights.study_plan).map(
              ([day, plan]: [string, string], index: number) => (
                <Text key={index} className="mb-1 text-base text-gray-600 dark:text-gray-300">
                  {day}: {plan}
                </Text>
              )
            )}
          </Section>
        )}

        {/* Full Transcription */}
        <Section title="Full Transcription" icon="align-left">
          <Text
            selectable
            selectionColor="#6366f180"
            className="text-base text-gray-600 dark:text-gray-300">
            {fullText}
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}