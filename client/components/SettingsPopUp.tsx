import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Switch, TextInput, Pressable, FlatList, Picker } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsPopUpProps {
  visible: boolean;
  onClose: () => void;
}

const SettingsPopUp: React.FC<SettingsPopUpProps> = ({ visible, onClose }) => {
  const [autoSave, setAutoSave] = useState<boolean>(false);
  const [maxRecordingDuration, setMaxRecordingDuration] = useState<string>('45');
  const [classes, setClasses] = useState<string[]>([]);
  const [currentClass, setCurrentClass] = useState<string>('');
  const [newClass, setNewClass] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('settings');
        if (savedSettings) {
          const { autoSave, maxRecordingDuration, currentClass, classes } = JSON.parse(savedSettings);
          setAutoSave(autoSave);
          setMaxRecordingDuration(maxRecordingDuration.toString());
          setCurrentClass(currentClass);
          setClasses(classes || []);
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };
    loadSettings();
  }, []);

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        const settings = {
          autoSave,
          maxRecordingDuration,
          currentClass,
          classes
        };
        await AsyncStorage.setItem('settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings', error);
      }
    };
    saveSettings();
  }, [autoSave, maxRecordingDuration, currentClass, classes]);

  const addClass = () => {
    if (newClass.trim() && !classes.includes(newClass.trim())) {
      setClasses([...classes, newClass.trim()]);
      setNewClass('');
    }
  };

  const removeClass = (classToRemove: string) => {
    const updatedClasses = classes.filter(cls => cls !== classToRemove);
    setClasses(updatedClasses);
    if (currentClass === classToRemove) {
      setCurrentClass('');
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40">
        <View className="w-4/5 rounded-2xl bg-white p-6 shadow-lg dark:bg-[#1E1E1E]">
          <Text className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">Settings</Text>

          {/* Auto-save setting */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-lg font-medium text-gray-800 dark:text-white">Auto-Save Recordings</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#6366f1' }}
              thumbColor={'#ffffff'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setAutoSave}
              value={autoSave}
            />
          </View>
          
          {/* Max recording duration */}
          <View className="mb-6">
            <Text className="text-lg font-medium text-gray-800 mb-2 dark:text-white">
              Max Recording Duration (minutes)
            </Text>
            <TextInput
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-lg 
                        bg-white text-black dark:bg-[#2D2D2D] dark:text-white dark:border-gray-600"
              keyboardType="numeric"
              value={maxRecordingDuration}
              onChangeText={setMaxRecordingDuration}
              placeholder="Enter duration"
              placeholderTextColor="#9ca3af"
            />
          </View>
          
          {/* Current class dropdown */}
          <View className="mb-4">
            <Text className="text-lg font-medium text-gray-800 mb-2 dark:text-white">
              Current Subject
            </Text>
            <Pressable
              onPress={() => setShowDropdown(!showDropdown)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 
                        bg-white dark:bg-[#2D2D2D] dark:border-gray-600"
            >
              <Text className="text-lg text-black dark:text-white">
                {currentClass || 'Select a subject'}
              </Text>
            </Pressable>
            
            {showDropdown && (
              <View className="mt-2 border border-gray-300 rounded-md dark:border-gray-600 max-h-40">
                <FlatList
                  data={classes}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        setCurrentClass(item);
                        setShowDropdown(false);
                      }}
                      className="px-4 py-2 flex-row justify-between items-center 
                                bg-white dark:bg-[#2D2D2D] border-b border-gray-200 dark:border-gray-600"
                    >
                      <Text className="text-lg text-black dark:text-white">{item}</Text>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          removeClass(item);
                        }}
                        className="p-1"
                      >
                        <Text className="text-red-500 text-lg">×</Text>
                      </TouchableOpacity>
                    </Pressable>
                  )}
                />
              </View>
            )}
          </View>
          
          {/* Add new class */}
          <View className="mb-6">
            <Text className="text-lg font-medium text-gray-800 mb-2 dark:text-white">
              Add New Class
            </Text>
            <View className="flex-row">
              <TextInput
                className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 text-lg 
                          bg-white text-black dark:bg-[#2D2D2D] dark:text-white dark:border-gray-600"
                value={newClass}
                onChangeText={setNewClass}
                placeholder="Enter class name"
                placeholderTextColor="#9ca3af"
                onSubmitEditing={addClass}
              />
              <TouchableOpacity
                onPress={addClass}
                className="bg-indigo-500 px-4 py-2 rounded-r-md justify-center items-center"
                disabled={!newClass.trim()}
              >
                <Text className="text-white text-lg font-medium">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            className="self-end bg-indigo-500 px-6 py-2 rounded-md"
            activeOpacity={0.7}
          >
            <Text className="font-medium text-white text-lg">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SettingsPopUp;