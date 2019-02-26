import React from 'react'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'

import SignInScreen from '../screens/SignInScreen'
import AuthLoadingScreen from '../screens/AuthLoadingScreen'
import ProfileScreen from '../screens/ProfileScreen'

import MainTabNavigator from './MainTabNavigator'

export default createAppContainer(
  createSwitchNavigator(
    {
      Main: MainTabNavigator,
      SignIn: SignInScreen,
      AuthLoading: AuthLoadingScreen,
      Profile: ProfileScreen,
    },
    {
      initialRouteName: 'AuthLoading',
    }
  )
)
