import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Modal, Text, Button } from 'react-native'

const Estimate = ({
  visible,
  estimate,
  handleRequest,
  handleCancel,
  ...props
}) => (
  <Modal visible={visible} {...props}>
    <View style={styles.estimateModalView}>
      <View>
        <Text style={styles.estimateModalTitle}>
          {estimate.fare.display} • {estimate.trip.distance_estimate}{' '}
          {estimate.trip.distance_unit}(s)
        </Text>
        <Text style={styles.estimateModalText}>
          Pickup ETA ${estimate.pickup_estimate} minutes
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
    </View>
  </Modal>
)

const styles = StyleSheet.create({
  estimateModalView: {
    paddingTop: 60,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  estimateModalTitle: {
    textAlign: 'center',
    fontSize: 30,
  },
  estimateModalText: {
    textAlign: 'center',
    fontSize: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
})

Estimate.propTypes = {
  estimate: PropTypes.object.isRequired,
  handleRequest: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  visible: PropTypes.bool,
}

Estimate.defaultProps = {
  visible: false,
}

export default Estimate
