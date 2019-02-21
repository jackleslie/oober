import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Modal, Text, Button } from 'react-native'

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
    backgroundColor: '#fff',
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
  receipt: PropTypes.object.isRequired,
  handleDone: PropTypes.func.isRequired,
  visible: PropTypes.bool,
}

Receipt.defaultProps = {
  visible: false,
}

export default Receipt
