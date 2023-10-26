import { View, Text } from 'react-native'
import React from 'react'

const ChannelSubscriber = () => {
  const { user } = useAuth();
  
  return (
    <View>
      <Text>ChannelSubscriber</Text>
    </View>
  )
}

export default ChannelSubscriber