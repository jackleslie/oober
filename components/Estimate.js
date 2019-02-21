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

const Estimate = ({
  visible,
  estimate,
  handleRequest,
  handleCancel,
  screenWidth,
  ...props
}) =>
  estimate ? (
    <View style={[styles.estimateContainer, { width: screenWidth }]}>
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
        <Button
          style={styles.productButton}
          title="Request"
          onPress={handleRequest}
        />
        <Button
          style={styles.productButton}
          title="Cancel"
          onPress={handleCancel}
        />
      </View>
    </View>
  ) : (
    <ActivityIndicator
      size="large"
      style={[styles.productIndicator, { width: screenWidth }]}
    />
  )

const styles = StyleSheet.create({
  estimateContainer: {
    paddingVertical: 5,
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
  estimate: PropTypes.object,
  handleRequest: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  screenWidth: PropTypes.number.isRequired,
  visible: PropTypes.bool,
}

Estimate.defaultProps = {
  visible: false,
}

export default Estimate
