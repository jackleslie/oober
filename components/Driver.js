import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Image, Text } from 'react-native'

import Profile from '../components/Profile'

const Driver = ({ driver, vehicle, screenWidth }) => (
  <View style={[styles.requestContainer, { width: screenWidth }]}>
    <Profile
      picture={driver.picture_url}
      name={driver.name}
      contact={driver.phone_number}
      verified
      verifiedText={driver.rating.toString()}
    />
    <View style={styles.vehicleContainer}>
      <Image
        source={{
          uri: vehicle.picture_url,
        }}
        style={styles.vehicleImage}
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
    flex: 1,
    flexDirection: 'row',
    paddingTop: 5,
    justifyContent: 'space-around',
  },
  requestStatusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleContainer: {
    flex: 1,
    paddingLeft: 5,
    paddingRight: 15,
  },
  vehicleImage: {
    flex: 1,
  },
  vehicleText: {
    flex: 1,
  },
  vehicleLicensePlate: {
    backgroundColor: '#fbce30',
    fontWeight: '900',
  },
})

Driver.propTypes = {
  driver: PropTypes.object.isRequired,
  vehicle: PropTypes.object.isRequired,
  screenWidth: PropTypes.number.isRequired,
}

export default Driver