import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text } from 'react-native'
import PureChart from 'react-native-pure-chart'
import generate from 'string-to-color'

const Analytics = ({ history }) => {
  let data = {}
  history.history.forEach(ride => {
    let key = ride.start_city.display_name
    let entry = {
      value: data[key] ? ++data[key].value : 1,
      color: generate(key),
      label: key,
    }
    data[key] = entry
  })
  return (
    <View style={styles.profileAnalytics} pointerEvents="none">
      <PureChart pointerEvents="none" data={Object.values(data)} type="pie" />
      <View>
        {Object.values(data).map((x, index) => (
          <Text key={index} style={{ color: x.color }}>{`${x.label}: ${
            x.value
          }`}</Text>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  profileAnalytics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
})

Analytics.propTypes = {
  history: PropTypes.object.isRequired,
}

export default Analytics
