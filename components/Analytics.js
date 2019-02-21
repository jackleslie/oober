import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text } from 'react-native'
import PureChart from 'react-native-pure-chart'

const Analytics = ({ history }) => {
  let data = {}
  const randomColor = () =>
    ('#' + ((Math.random() * 0xffffff) << 0).toString(16) + '000000').slice(
      0,
      7
    )
  history.history.forEach(ride => {
    let key = ride.start_city.display_name
    let entry = {
      value: data[key] ? ++data[key].value : 1,
      color: randomColor(),
      label: key,
    }
    data[key] = entry
  })
  return (
    <View style={styles.profileHistory}>
      <PureChart pointerEvents="none" data={Object.values(data)} type="pie" />
      <View style={{ paddingLeft: 10 }}>
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
  profileHistory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  history: {
    paddingBottom: 5,
  },
  historyTitle: {
    fontSize: 25,
    fontWeight: '400',
  },
  historyDateTime: {
    fontSize: 16,
    fontWeight: '300',
  },
})

Analytics.propTypes = {
  history: PropTypes.object.isRequired,
}

export default Analytics
