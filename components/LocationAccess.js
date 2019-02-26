import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, ScrollView, RefreshControl, Text } from 'react-native'

/**
 * Presentational component to prompt location access grant
 */
const LocationAccess = ({ refreshing, handleRefresh, handleLink }) => (
  <ScrollView
    contentContainerStyle={styles.container}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    }
  >
    <Text>Please allow location access in </Text>
    <Text style={styles.link} onPress={handleLink}>
      Settings
    </Text>
  </ScrollView>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    fontWeight: '600',
  },
})

LocationAccess.propTypes = {
  /**
   * Determines if refresh control is in refreshing state
   */
  refreshing: PropTypes.bool.isRequired,
  /**
   * Function to handle refreshing to see if location access has been granted
   */
  handleRefresh: PropTypes.func.isRequired,
  /**
   * Function to handle link to location access granting page in settings
   */
  handleLink: PropTypes.func.isRequired,
}

export default LocationAccess
