import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Image, Text } from 'react-native'

import Profile from './Profile'

import Layout from '../constants/Layout'
import Colors from '../constants/Colors'

/**
 * Presentational component displaying information about an Uber driver
 */
const Driver = ({ driver, vehicle }) => (
  <View style={[styles.requestContainer, { width: Layout.window.width }]}>
    <Profile
      picture={driver.picture_url}
      name={driver.name}
      contact={driver.phone_number}
      verifiedText={driver.rating.toString()}
      isDriver
    />
    <View style={styles.vehicleContainer}>
      <Image
        source={{
          uri: vehicle.picture_url,
        }}
        style={styles.vehicleImage}
        resizeMode="contain"
      />
      <Text style={styles.vehicleText}>
        {vehicle.make} {vehicle.model}
        {'\n'}
        <Text style={styles.vehicleLicensePlate}>{vehicle.license_plate}</Text>
      </Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  requestContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  vehicleImage: {
    flex: 1,
  },
  vehicleText: {
    flex: 1,
    textAlign: 'center',
  },
  vehicleLicensePlate: {
    backgroundColor: Colors.vehicleLicensePlate,
    fontWeight: '900',
    textAlign: 'center',
  },
})

Driver.propTypes = {
  /**
   * Driver object from Uber API
   */
  driver: PropTypes.object.isRequired,
  /**
   * Vehicle object from Uber API
   */
  vehicle: PropTypes.object.isRequired,
}

export default Driver
