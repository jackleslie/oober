import React from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet,
  View,
  Modal,
  Text,
  Button,
  ActivityIndicator,
} from 'react-native'

import Layout from '../constants/Layout'

/**
 * Presentational component displaying information about an Uber request estimate
 */
const Estimate = ({ estimate, handleRequest, handleCancel }) =>
  estimate ? (
    <View style={[styles.estimateContainer, { width: Layout.window.width }]}>
      <Text style={styles.estimateTitle}>
        {estimate.fare.display} • {estimate.trip.distance_estimate}{' '}
        {estimate.trip.distance_unit}(s)
      </Text>
      <Text style={styles.estimateText}>
        Pickup ETA{' '}
        {estimate.pickup_estimate
          ? `${estimate.pickup_estimate} minute(s)`
          : 'TBC'}
      </Text>
      <View style={styles.buttonRow}>
        <Button title="Request" onPress={handleRequest} />
        <Button title="Cancel" onPress={handleCancel} />
      </View>
    </View>
  ) : (
    <ActivityIndicator
      size="large"
      style={[styles.productIndicator, { width: Layout.window.width }]}
    />
  )

const styles = StyleSheet.create({
  estimateContainer: {
    justifyContent: 'center',
  },
  estimateTitle: {
    textAlign: 'center',
    fontSize: 30,
  },
  estimateText: {
    textAlign: 'center',
    fontSize: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
})

Estimate.propTypes = {
  /**
   * Request estimate object from Uber API
   */
  estimate: PropTypes.object,
  /**
   * Function to handle making request to Uber API
   */
  handleRequest: PropTypes.func.isRequired,
  /**
   * Function to handle cancelling request making process
   * @type {[type]}
   */
  handleCancel: PropTypes.func.isRequired,
}

Estimate.defaultProps = {
  estimate: null,
}

export default Estimate
