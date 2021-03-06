import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Image, Text, Button } from 'react-native'

import Layout from '../constants/Layout'

/**
 * Presentational component displaying Uber product data
 */
const Product = ({ product, handleChoose }) => (
  <View style={[styles.product, { width: Layout.window.width }]}>
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      <Text style={styles.productTitle}>{product.display_name}</Text>
      <Image
        source={{ uri: product.image }}
        style={styles.productImage}
        resizeMode="contain"
      />
    </View>
    <Text style={styles.productDescription}>{product.description}</Text>
    <Button title="Choose" onPress={() => handleChoose(product.product_id)} />
  </View>
)

const styles = StyleSheet.create({
  product: {
    paddingTop: 10,
  },
  productIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: 30,
    height: 30,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    paddingRight: 5,
  },
  productDescription: {
    textAlign: 'center',
    fontWeight: '100',
    fontStyle: 'italic',
    fontSize: 10,
  },
})

Product.propTypes = {
  /**
   * Product object from Uber API
   */
  product: PropTypes.object.isRequired,
  /**
   * Function to handle choosing specified product
   */
  handleChoose: PropTypes.func.isRequired,
}

export default Product
