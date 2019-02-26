import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text } from 'react-native'
import { VictoryPie, VictoryBar } from 'victory-native'
import moment from 'moment'

/**
 * Presentational component displaying historical trip data as visualisations
 */
const Analytics = ({ history }) => {
  let pieData = {}
  let chartData = {
    Jan: {
      x: 'Jan',
      y: 0,
    },
    Feb: {
      x: 'Feb',
      y: 0,
    },
    Mar: {
      x: 'Mar',
      y: 0,
    },
    Apr: {
      x: 'Apr',
      y: 0,
    },
    May: {
      x: 'May',
      y: 0,
    },
    Jun: {
      x: 'Jun',
      y: 0,
    },
    Jul: {
      x: 'Jul',
      y: 0,
    },
    Aug: {
      x: 'Aug',
      y: 0,
    },
    Sep: {
      x: 'Sep',
      y: 0,
    },
    Oct: {
      x: 'Oct',
      y: 0,
    },
    Nov: {
      x: 'Nov',
      y: 0,
    },
    Dec: {
      x: 'Dec',
      y: 0,
    },
  }
  history.forEach(ride => {
    let key = ride.start_city.display_name
    let pieEntry = {
      x: key,
      y: pieData[key] ? ++pieData[key].y : 1,
    }
    pieData[key] = pieEntry

    let month = moment(ride.start_time, 'X').format('MMM')
    let chartEntry = {
      x: month,
      y: ++chartData[month].y,
    }
    chartData[month] = chartEntry
  })
  return (
    <View>
      <Text style={styles.chartTitle}>Trips per Location</Text>
      <View pointerEvents="none">
        <VictoryPie data={Object.values(pieData)} padding={75} />
      </View>
      <Text style={styles.chartTitle}>Trips by Month</Text>
      <View pointerEvents="none" style={{ alignItems: 'center' }}>
        <VictoryBar
          data={Object.values(chartData)}
          labels={d => `${d.x}:${d.y}`}
          padding={50}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  chartTitle: {
    fontSize: 21,
    fontWeight: '300',
  },
})

Analytics.propTypes = {
  /**
   * Array of trips from Uber API
   */
  history: PropTypes.array.isRequired,
}

export default Analytics
