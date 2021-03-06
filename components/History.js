import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text } from 'react-native'
import moment from 'moment'

/**
 * Presentational component displaying historical trip data
 */
const History = ({ history }) => (
  <View style={styles.profileHistory}>
    {history.map(ride => {
      return (
        <View key={ride.request_id} style={styles.history}>
          <Text style={styles.historyTitle}>
            {ride.start_city.display_name}
          </Text>
          <Text style={styles.historyDateTime}>
            {moment(ride.start_time, 'X').format('MMMM Do YYYY')}
          </Text>
          <Text style={styles.historyDateTime}>
            {`${moment(ride.start_time, 'X').format('h:mma')} - ${moment(
              ride.end_time,
              'X'
            ).format('h:mma')}`}
          </Text>
        </View>
      )
    })}
  </View>
)

const styles = StyleSheet.create({
  profileHistory: {
    alignItems: 'stretch',
  },
  history: {
    paddingBottom: 5,
  },
  historyTitle: {
    fontSize: 21,
    fontWeight: '500',
  },
  historyDateTime: {
    fontSize: 14,
    fontWeight: '300',
  },
})

History.propTypes = {
  /**
   * Array of trips from Uber API
   */
  history: PropTypes.array.isRequired,
}

export default History
