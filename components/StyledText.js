import React from 'react'
import { Text } from 'react-native'

export const MonoText = ({ ...props }) => (
  <Text {...props} style={[props.style, { fontFamily: 'space-mono' }]} />
)
