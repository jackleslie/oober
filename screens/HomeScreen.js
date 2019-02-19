import React from 'react'
import axios from 'axios'
import {
  Image,
  Button,
  Platform,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  AsyncStorage,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native'
import { WebBrowser, MapView, Location } from 'expo'

import { MonoText } from '../components/StyledText'
import Profile from '../components/Profile'

import carImg from '../assets/images/Car.png'

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props)
    //this._getLocationAsync()
    this._bootstrapAsync()
    this.state = {
      latitude: 37.774929,
      longitude: -122.419418,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
      address: null,
      refreshing: false,
      products: null,
      requestEstimate: null,
      request: null,
      driver: null,
      driverLocation: new MapView.AnimatedRegion({
        latitude: 0.0922,
        longitude: 0.0421,
      }),
      inCar: false,
    }
  }

  static navigationOptions = {
    header: null,
  }

  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken')
    axios
      .get(`https://sandbox-api.uber.com/v1.2/products`, {
        params: {
          latitude: this.state.latitude,
          longitude: this.state.longitude,
        },
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })
      .then(results => {
        this.setState({
          products: results.data.products,
        })
      })
  }

  _onRefresh = () => {
    this.setState({ refreshing: true })
    this._getLocationAsync().then(() => {
      this.setState({ refreshing: false })
    })
  }

  _getLocationAsync = async () => {
    Location.getCurrentPositionAsync({})
      .then(location => {
        this.setState({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })
        return Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })
      })
      .then(results => {
        this.setState({
          address: results[0].name,
        })
        return this._bootstrapAsync()
      })
      .catch(console.log)
  }

  _handleUberSelectAsync = async product_id => {
    const userToken = await AsyncStorage.getItem('userToken')
    axios({
      method: 'post',
      url: 'https://sandbox-api.uber.com/v1.2/requests/estimate',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: {
        product_id: product_id,
        start_latitude: this.state.latitude,
        start_longitude: this.state.longitude,
        end_latitude: 37.762009,
        end_longitude: -122.434677,
      },
    })
      .then(response => {
        response.data.product_id = product_id
        console.log(response.data)
        this.setState({
          requestEstimate: response.data,
        })
      })
      .catch(console.log)
  }

  _handleUberRequestAsync = async (product_id, fare_id) => {
    const userToken = await AsyncStorage.getItem('userToken')
    axios({
      method: 'post',
      url: 'https://sandbox-api.uber.com/v1.2/requests',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: {
        fare_id: fare_id,
        product_id: product_id,
        start_latitude: this.state.latitude,
        start_longitude: this.state.longitude,
        end_latitude: 37.762009,
        end_longitude: -122.434677,
      },
    }).then(response => {
      console.log(response.data)
      this.setState({
        requestEstimate: null,
        request: response.data,
      })
      return axios({
        method: 'put',
        url: `https://sandbox-api.uber.com/v1.2/sandbox/requests/${
          response.data.request_id
        }`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        data: {
          status: 'accepted',
        },
      }).then(response => {
        console.log(response.data)
        this.interval = setInterval(
          () => this._handleUberRequestReloadAsync(response.data.request_id),
          2000
        )
      })
    })
  }

  _handleUberRequestReloadAsync = async request_id => {
    const userToken = await AsyncStorage.getItem('userToken')
    axios
      .get(
        `https://sandbox-api.uber.com/v1.2/requests/${
          this.state.request.request_id
        }`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      )
      .then(response => {
        console.log(response.data)
        this.setState({
          request: response.data,
        })
      })
      .then(() => {
        const { location } = this.state.request
        const { driverLocation } = this.state
        const newCoordinate = {
          latitude: location.latitude,
          longitude: location.longitude,
        }

        if (Platform.OS === 'android') {
          if (this.driver) {
            this.driver._component.animateMarkerToCoordinate(newCoordinate, 500)
          }
        } else {
          driverLocation.timing(newCoordinate).start()
        }
      })
  }

  _handleUberCancelRequestAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken')
    axios({
      method: 'delete',
      url: 'https://sandbox-api.uber.com/v1.2/requests/current',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }).then(() => {
      this.setState({
        requestEstimate: null,
        request: null,
        inCar: false,
      })
      clearInterval(this.interval)
    })
  }

  _handleUberInCarAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken')
    axios({
      method: 'put',
      url: `https://sandbox-api.uber.com/v1.2/sandbox/requests/${
        this.state.request.request_id
      }`,
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: {
        status: 'arriving',
      },
    })
      .then(() => {
        axios({
          method: 'put',
          url: `https://sandbox-api.uber.com/v1.2/sandbox/requests/${
            this.state.request.request_id
          }`,
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          data: {
            status: 'in_progress',
          },
        })
      })
      .then(() => {
        this.setState({
          inCar: true,
        })
      })
  }

  _handleUberTripEndAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken')
    axios({
      method: 'put',
      url: `https://sandbox-api.uber.com/v1.2/sandbox/requests/${
        this.state.request.request_id
      }`,
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: {
        status: 'completed',
      },
    })
      .then(() => this._handleUberCancelRequestAsync())
      .then(() => {
        this.setState({
          latitude: 37.762009,
          longitude: -122.434677,
        })
      })
  }

  render() {
    const { navigate } = this.props.navigation
    let location = {
      latitude: this.state.latitude,
      longitude: this.state.longitude,
    }
    let screenWidth = Dimensions.get('window').width
    return this.state.latitude ? (
      <>
        <MapView
          style={{ flex: 5 }}
          initialRegion={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {!this.state.inCar && (
            <MapView.Marker
              coordinate={location}
              title={'Current Location'}
              description={this.state.address}
            />
          )}
          {this.state.request && this.state.request.location && (
            <MapView.Marker.Animated
              ref={driver => {
                this.driver = driver
              }}
              coordinate={this.state.driverLocation}
              image={carImg}
              style={{
                transform: [
                  { rotate: `${this.state.request.location.bearing}deg` },
                ],
              }}
            />
          )}
        </MapView>
        <Modal
          animationType="fade"
          transparent={false}
          visible={this.state.requestEstimate !== null}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.')
          }}
          presentationStyle="overFullScreen"
          transparent
        >
          <View style={styles.estimateModalView}>
            <View>
              <Text style={styles.estimateModalTitle}>
                {this.state.requestEstimate &&
                  `${this.state.requestEstimate.fare.display} • ${
                    this.state.requestEstimate.trip.distance_estimate
                  } ${this.state.requestEstimate.trip.distance_unit}(s)`}
              </Text>
              <Text style={styles.estimateModalText}>
                {this.state.requestEstimate &&
                  `Pickup ETA ${
                    this.state.requestEstimate.pickup_estimate
                  } minutes`}
              </Text>
              <View style={styles.buttonRow}>
                <Button
                  style={styles.productButton}
                  title="Request"
                  onPress={() =>
                    this._handleUberRequestAsync(
                      this.state.requestEstimate.product_id,
                      this.state.requestEstimate.fare.fare_id
                    )
                  }
                />
                <Button
                  style={styles.productButton}
                  title="Cancel"
                  onPress={() => this.setState({ requestEstimate: null })}
                />
              </View>
            </View>
          </View>
        </Modal>
        <ScrollView style={styles.productContainer} pagingEnabled horizontal>
          {this.state.products ? (
            this.state.products.length > 0 ? (
              !this.state.request ? (
                this.state.products.map(product => (
                  <View
                    key={product.product_id}
                    style={[styles.product, { width: screenWidth }]}
                  >
                    <Image
                      source={{ uri: product.image }}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.productTitle}>
                      {product.display_name}
                    </Text>
                    <Text style={styles.productDescription}>
                      {product.description}
                    </Text>
                    <Button
                      style={styles.productButton}
                      title="Choose"
                      onPress={() =>
                        this._handleUberSelectAsync(product.product_id)
                      }
                    />
                  </View>
                ))
              ) : (
                <>
                  <View
                    style={[
                      styles.requestStatusContainer,
                      { width: screenWidth },
                    ]}
                  >
                    <Text style={styles.productTitle}>
                      Request {this.state.request.status}
                    </Text>
                    <View style={styles.buttonRow}>
                      {this.state.request.status === 'accepted' && (
                        <Button
                          title="I'm in!"
                          onPress={this._handleUberInCarAsync}
                        />
                      )}
                      {this.state.request.status === 'in_progress' && (
                        <Button
                          title="Arrived"
                          onPress={this._handleUberTripEndAsync}
                        />
                      )}
                      <Button
                        title="Cancel Request"
                        onPress={this._handleUberCancelRequestAsync}
                      />
                    </View>
                  </View>
                  {this.state.request.driver && (
                    <View
                      style={[styles.requestContainer, { width: screenWidth }]}
                    >
                      <Profile
                        picture={this.state.request.driver.picture_url}
                        name={this.state.request.driver.name}
                        contact={this.state.request.driver.phone_number}
                        verified
                        verifiedText={this.state.request.driver.rating.toString()}
                      />
                      <View style={styles.vehicleContainer}>
                        <Image
                          source={{
                            uri: this.state.request.vehicle.picture_url,
                          }}
                          style={styles.vehicleImage}
                        />
                        <Text style={styles.vehicleText}>
                          {this.state.request.vehicle.make}{' '}
                          {this.state.request.vehicle.model}
                          {'\n'}
                          <Text style={styles.vehicleLicensePlate}>
                            {this.state.request.vehicle.license_plate}
                          </Text>
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              )
            ) : (
              <View style={[styles.product, { width: screenWidth }]}>
                <Text style={styles.productTitle}>No drivers available</Text>
              </View>
            )
          ) : (
            <ActivityIndicator
              size="large"
              style={[styles.productIndicator, { width: screenWidth }]}
            />
          )}
        </ScrollView>
      </>
    ) : (
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
          />
        }
      >
        <Text>Please allow location access in </Text>
        <Text
          style={styles.link}
          onPress={() => Linking.openURL('app-settings:')}
        >
          Settings
        </Text>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productContainer: {
    flex: 1,
    padding: 8,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: -16,
  },
  productDescription: {
    textAlign: 'center',
    fontWeight: '100',
    fontStyle: 'italic',
    fontSize: 10,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  link: {
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  product: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  productIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
  },
  productButton: {
    marginTop: -15,
  },
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
  requestContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 5,
    justifyContent: 'space-around',
  },
  requestStatusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleContainer: {
    flex: 1,
    paddingLeft: 5,
    paddingRight: 15,
  },
  vehicleImage: {
    flex: 1,
  },
  vehicleText: {
    flex: 1,
  },
  vehicleLicensePlate: {
    backgroundColor: '#fbce30',
    fontWeight: '900',
  },
})
