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

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props)
    this._getLocationAsync()
  }

  state = {
    latitude: null,
    longitude: null,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
    address: null,
    refreshing: false,
    products: null,
    requestEstimate: null,
    request: null,
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
        end_latitude: this.state.latitude - 0.05,
        end_longitude: this.state.longitude - 0.05,
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
        end_latitude: this.state.latitude - 0.05,
        end_longitude: this.state.longitude - 0.05,
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
      }).then(response => console.log(response.data))
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
          <MapView.Marker
            coordinate={location}
            title={'Current Location'}
            description={this.state.address}
          />
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
                  `${this.state.requestEstimate.fare.display} | ${
                    this.state.requestEstimate.trip.distance_estimate
                  } ${this.state.requestEstimate.trip.distance_unit}(s)`}
              </Text>
              <Text style={styles.estimateModalText}>
                {this.state.requestEstimate &&
                  `Pickup ETA ${
                    this.state.requestEstimate.pickup_estimate
                  } minutes`}
              </Text>
              <View style={styles.estimateModalButtonRow}>
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
                      title="Select"
                      onPress={() =>
                        this._handleUberSelectAsync(product.product_id)
                      }
                    />
                  </View>
                ))
              ) : (
                <View style={[styles.requestContainer, { width: screenWidth }]}>
                  <Text style={styles.productTitle}>Request Active</Text>
                  <Button
                    title="Reload"
                    onPress={() =>
                      this._handleUberRequestReloadAsync(
                        this.state.request.request_id
                      )
                    }
                  />
                  <Text style={styles.productTitle}>
                    {this.state.request.status}
                  </Text>
                </View>
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
    borderTopColor: 'rgba(0,0,0,0.2)',
    borderTopWidth: 1,
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
    borderRadius: 20,
  },
  estimateModalTitle: {
    textAlign: 'center',
    fontSize: 30,
  },
  estimateModalText: {
    textAlign: 'center',
    fontSize: 18,
  },
  estimateModalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  requestContainer: {
    paddingTop: 20,
  },
})
