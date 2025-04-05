import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStack';
import { ChevronLeft } from 'lucide-react-native';
import { Feather } from '@expo/vector-icons';

type ResultsRouteProp = RouteProp<RootStackParamList, 'Results'>;

interface ResultsProps {
  route: ResultsRouteProp;
}

export default function Results({ route }: ResultsProps) {
  const { insights, fullText } = route.params;
  console.log('Results: ', insights, fullText);
  const navigation = useNavigation();

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

  return (
    <View className="flex-1 bg-white px-6 pt-16 dark:bg-[#121212]">
      {/* Header */}
      <View className="mb-8 flex-row items-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-2 rounded-full p-2"
        >
          <ChevronLeft size={24} color="#6366f1" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100">Results</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1">
        {/* Summary */}
        <Section title="Summary" icon="file-text">
          <Text
            selectable
            selectionColor="#6366f180"
            className="text-base text-gray-600 dark:text-gray-300"
          >
            {insights?.summary || 'No summary available.'}
          </Text>
        </Section>

        {/* Key Points */}
        {insights?.key_points?.length > 0 && (
          <Section title="Key Points" icon="list">
            {insights.key_points.map((point: string, index: number) => (
              <Text
                key={index}
                className="mb-1 text-base text-gray-600 dark:text-gray-300"
              >
                • {point}
              </Text>
            ))}
          </Section>
        )}

        {/* Test Questions */}
        {insights?.test_questions?.length > 0 && (
          <Section title="Potential Test Questions" icon="help-circle">
            {insights.test_questions.map((q: string, index: number) => (
              <Text
                key={index}
                className="mb-1 text-base text-gray-600 dark:text-gray-300"
              >
                - {q}
              </Text>
            ))}
          </Section>
        )}

        {/* Glossary */}
        {insights?.glossary?.length > 0 && (
          <Section title="Glossary" icon="book-open">
            {insights.glossary.map(
              (
                entry: { term: string; definition: string },
                index: number
              ) => (
                <View key={index} className="mb-2">
                  <Text className="text-base font-semibold text-indigo-500 dark:text-indigo-400">
                    {entry.term}
                  </Text>
                  <Text className="text-base text-gray-600 dark:text-gray-300">
                    {entry.definition}
                  </Text>
                </View>
              )
            )}
          </Section>
        )}

        {/* Lecture Structure */}
        {insights?.lecture_structure?.length > 0 && (
          <Section title="Lecture Structure" icon="clock">
            {insights.lecture_structure.map((line: string, index: number) => (
              <Text
                key={index}
                className="mb-1 text-base text-gray-600 dark:text-gray-300"
              >
                {line}
              </Text>
            ))}
          </Section>
        )}

        {/* Action Items */}
        {insights?.action_items?.length > 0 && (
          <Section title="Action Items" icon="check-circle">
            {insights.action_items.map((item: string, index: number) => (
              <Text
                key={index}
                className="mb-1 text-base text-gray-600 dark:text-gray-300"
              >
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
                <Text
                  key={index}
                  className="mb-1 text-base text-gray-600 dark:text-gray-300"
                >
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
            className="text-base text-gray-600 dark:text-gray-300"
          >
            {fullText}
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}
