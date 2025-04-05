

import { View, Text, ScrollView, TouchableOpacity, Alert, SectionList } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';

export default function Recordings() {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [expandedClass, setExpandedClass] = useState<string | null>(null); // State for tracking which class is expanded
  const navigation = useNavigation();

  // Fetch recordings from AsyncStorage
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const stored = await AsyncStorage.getItem('audio');
        const parsed = stored ? JSON.parse(stored) : [];
        setRecordings(parsed.reverse());
      } catch (error) {
        console.error('Failed to load recordings:', error);
      }
    };

    fetchRecordings();
  }, []);

  // Handle delete action for a recording
  const handleDelete = async (indexToDelete: number) => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = [...recordings];
              updated.splice(indexToDelete, 1);
              setRecordings(updated);

              await AsyncStorage.setItem('audio', JSON.stringify([...updated].reverse()));
            } catch (error) {
              console.error('Failed to delete recording:', error);
            }
          },
        },
      ]
    );
  };

  // Organize recordings by class
  const groupedRecordings = recordings.reduce((acc, rec) => {
    const className = rec.subject;
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(rec);
    return acc;
  }, {});

  const handleToggleClass = (className: string) => {
    setExpandedClass(expandedClass === className ? null : className); // Toggle class visibility
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
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100">Recordings</Text>
        <View className="w-6" />
      </View>

      {/* Content */}
      <ScrollView>
        {Object.keys(groupedRecordings).length === 0 ? (
          <Text className="text-base text-gray-600 dark:text-gray-400">No recordings found.</Text>
        ) : (
          Object.keys(groupedRecordings).map((className) => (
            <View key={className} className="mb-6">
              {/* Class Dropdown */}
              <TouchableOpacity
                className="flex-row items-center justify-between"
                onPress={() => handleToggleClass(className)}>
                <Text className="text-lg font-semibold text-gray-800 dark:text-white">{className}</Text>
                {expandedClass === className ? (
                  <ChevronUp size={20} color="#6366f1" />
                ) : (
                  <ChevronDown size={20} color="#6366f1" />
                )}
              </TouchableOpacity>

              {/* List of recordings under the class */}
              {expandedClass === className && (
                <View className="mt-2">
                  {groupedRecordings[className].map((rec, index) => (
                    <View
                      key={index}
                      className="mb-4 rounded-xl bg-gray-100 p-4 dark:bg-[#1E1E1E]">
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('Results' as never, {
                            subject: rec.subject,
                            insights: rec.insights,
                            fullText: rec.fullText,
                            recordingUri: rec.recordingUri,
                          } as never)
                        }>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-lg font-semibold text-gray-800 dark:text-white">
                            Recording {groupedRecordings[className].length - index}
                          </Text>
                          <ChevronRight size={20} color="#6366f1" />
                        </View>
                        <Text
                          numberOfLines={2}
                          className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {rec.fullText?.slice(0, 100)}...
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDelete(index)}
                        className="mt-2 self-end rounded-full p-1">
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
