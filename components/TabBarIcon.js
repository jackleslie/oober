import React from 'react'
import { Icon } from 'expo'

import Colors from '../constants/Colors'

const TabBarIcon = ({ ...props }) => (
  <Icon.Ionicons
    name={props.name}
    size={26}
    style={{ marginBottom: -3 }}
    color={props.focused ? Colors.tabIconSelected : Colors.tabIconDefault}
  />
)

export default TabBarIcon
