import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text } from 'react-native'
import moment from 'moment'

const History = ({ history }) => (
  <View style={styles.profileHistory}>
    {history.history.map(ride => {
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
    fontSize: 24,
    fontWeight: '400',
  },
  historyDateTime: {
    fontSize: 14,
    fontWeight: '300',
  },
})

History.propTypes = {
  history: PropTypes.object.isRequired,
}

export default History
