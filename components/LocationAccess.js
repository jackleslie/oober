import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, ScrollView, RefreshControl, Text } from 'react-native'

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
  refreshing: PropTypes.bool.isRequired,
  handleRefresh: PropTypes.func.isRequired,
  handleLink: PropTypes.func.isRequired,
}

export default LocationAccess
