import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Pressable,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SubjectSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (className: string) => void;
}

const SubjectSelectionModal: React.FC<SubjectSelectionModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [classes, setClasses] = useState<string[]>([]);
  const [newClass, setNewClass] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<string>('');

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('settings');
        if (savedSettings) {
          const { classes = [] } = JSON.parse(savedSettings);
          setClasses(classes);
        }
      } catch (error) {
        console.error('Failed to load classes', error);
      }
    };
    loadClasses();
  }, []);

  const addClass = () => {
    if (newClass.trim() && !classes.includes(newClass.trim())) {
      const updatedClasses = [...classes, newClass.trim()];
      setClasses(updatedClasses);
      setNewClass('');
      // Save to AsyncStorage
      AsyncStorage.getItem('settings').then((savedSettings) => {
        const settings = savedSettings ? JSON.parse(savedSettings) : {};
        AsyncStorage.setItem('settings', JSON.stringify({ ...settings, classes: updatedClasses }));
      });
    }
  };

  const removeClass = (classToRemove: string) => {
    const updatedClasses = classes.filter((cls) => cls !== classToRemove);
    setClasses(updatedClasses);
    if (selectedClass === classToRemove) {
      setSelectedClass('');
    }
    // Save to AsyncStorage
    AsyncStorage.getItem('settings').then((savedSettings) => {
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      AsyncStorage.setItem('settings', JSON.stringify({ ...settings, classes: updatedClasses }));
    });
  };

  const handleSubmit = () => {
    if (!selectedClass) {
      Alert.alert('No Subject Selected', 'Please select a subject before proceeding.');
      return;
    }
    onSubmit(selectedClass);
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40">
        <View className="w-4/5 rounded-2xl bg-white p-6 shadow-lg dark:bg-[#1E1E1E]">
          <Text className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
            Select Subject
          </Text>

          {/* Current subject dropdown */}
          <View className="mb-4">
            <Text className="mb-2 text-lg font-medium text-gray-800 dark:text-white">
              Current Subject
            </Text>
            <Pressable
              onPress={() => setShowDropdown(!showDropdown)}
              className="w-full rounded-md border border-gray-300 bg-white px-4 
                        py-2 dark:border-gray-600 dark:bg-[#2D2D2D]">
              <Text className="text-lg text-black dark:text-white">
                {selectedClass || 'Select a subject'}
              </Text>
            </Pressable>

            {showDropdown && (
              <View className="mt-2 max-h-40 rounded-md border border-gray-300 dark:border-gray-600">
                <FlatList
                  data={classes}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        setSelectedClass(item);
                        setShowDropdown(false);
                      }}
                      className="flex-row items-center justify-between border-b border-gray-200 
                                bg-white px-4 py-2 dark:border-gray-600 dark:bg-[#2D2D2D]">
                      <Text className="text-lg text-black dark:text-white">{item}</Text>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          removeClass(item);
                        }}
                        className="p-1">
                        <Text className="text-lg text-red-500">×</Text>
                      </TouchableOpacity>
                    </Pressable>
                  )}
                />
              </View>
            )}
          </View>

          {/* Add new subject */}
          <View className="mb-6">
            <Text className="mb-2 text-lg font-medium text-gray-800 dark:text-white">
              Add New Subject
            </Text>
            <View className="flex-row">
              <TextInput
                className="flex-1 rounded-l-md border border-gray-300 bg-white px-4 py-2 
                          text-lg text-black dark:border-gray-600 dark:bg-[#2D2D2D] dark:text-white"
                value={newClass}
                onChangeText={setNewClass}
                placeholder="Enter subject name"
                placeholderTextColor="#9ca3af"
                onSubmitEditing={addClass}
              />
              <TouchableOpacity
                onPress={addClass}
                className="items-center justify-center rounded-r-md bg-indigo-500 px-4 py-2"
                disabled={!newClass.trim()}>
                <Text className="text-lg font-medium text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="self-end rounded-md bg-indigo-500 px-6 py-2"
            activeOpacity={0.7}>
            <Text className="text-lg font-medium text-white">Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SubjectSelectionModal;
