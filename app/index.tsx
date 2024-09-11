import { Text, View } from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { Link } from 'expo-router'

const App = () => {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-3xl text-teal-500 font-semibold">Aora!</Text>
      <StatusBar style='auto' />
      <Link href="/profile" style={{color: 'blue'}}>Go to Profile</Link>
    </View>
  )
}

export default App