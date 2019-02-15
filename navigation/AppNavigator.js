import React from 'react'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'

import SignInScreen from '../screens/SignInScreen'
import AuthLoadingScreen from '../screens/AuthLoadingScreen'
import ProfileScreen from '../screens/ProfileScreen'

import MainTabNavigator from './MainTabNavigator'

export default createAppContainer(
  createSwitchNavigator(
    {
      // You could add another route here for authentication.
      // Read more at https://reactnavigation.org/docs/en/auth-flow.html
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
