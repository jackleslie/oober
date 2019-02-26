import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Modal, Text, Button } from 'react-native'

/**
 * Presentational component displaying receipt data as a modal
 */
const Receipt = ({ visible, receipt, handleDone, ...props }) => (
  <Modal visible={visible} {...props} onRequestClose={handleDone}>
    <View style={styles.receiptModalView}>
      <Text style={styles.receiptModalTitle}>Trip Completed!</Text>
      <Text style={styles.receiptModalText}>
        Total Fare: {receipt.total_fare}
      </Text>
      <Text style={styles.receiptModalText}>Duration: {receipt.duration}</Text>
      <Text style={styles.receiptModalText}>
        Distance: {receipt.distance} {receipt.distance_label}
      </Text>
      <Button title="Done" onPress={handleDone} />
    </View>
  </Modal>
)

const styles = StyleSheet.create({
  receiptModalView: {
    paddingTop: 100,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  receiptModalTitle: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '600',
    paddingBottom: 10,
  },
  receiptModalText: {
    textAlign: 'center',
    fontSize: 18,
  },
})

Receipt.propTypes = {
  /**
   * Receipt object from Uber API
   */
  receipt: PropTypes.object.isRequired,
  /**
   * Function to handle finishing viewing receipt data
   */
  handleDone: PropTypes.func.isRequired,
  /**
   * Determines if modal is visible currently
   */
  visible: PropTypes.bool,
}

Receipt.defaultProps = {
  visible: false,
}

export default Receipt
