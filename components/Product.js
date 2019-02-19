import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Image, Text, Button } from 'react-native'

const Product = ({ product, screenWidth, handleChoose }) => (
  <View style={[styles.product, { width: screenWidth }]}>
    <View style={{ flexDirection: 'row' }}>
      <Text style={styles.productTitle}>{product.display_name}</Text>
      <Image
        source={{ uri: product.image }}
        style={styles.productImage}
        resizeMode="contain"
      />
    </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
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
  productButton: {
    marginTop: -15,
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
  product: PropTypes.object.isRequired,
  screenWidth: PropTypes.number.isRequired,
  handleChoose: PropTypes.func.isRequired,
}

export default Product
