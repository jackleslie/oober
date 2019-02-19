import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Image, Text, Button } from 'react-native'

const Product = ({ product, screenWidth, handleChoose }) => (
  <View style={[styles.product, { width: screenWidth }]}>
    <Image
      source={{ uri: product.image }}
      style={styles.productImage}
      resizeMode="contain"
    />
    <Text style={styles.productTitle}>{product.display_name}</Text>
    <Text style={styles.productDescription}>{product.description}</Text>
    <Button
      style={styles.productButton}
      title="Choose"
      onPress={() => handleChoose(product.product_id)}
    />
  </View>
)

const styles = StyleSheet.create({
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
})

Product.propTypes = {
  product: PropTypes.object.isRequired,
  screenWidth: PropTypes.number.isRequired,
  handleChoose: PropTypes.func.isRequired,
}

export default Product
