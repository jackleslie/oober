import React from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet,
  View,
  Image,
  Text,
  Platform,
  Button,
  Linking,
} from 'react-native'
import { Icon } from 'expo'

import Colors from '../constants/Colors'

/**
 * Presentational component displaying various personal data
 */
const Profile = ({
  picture,
  name,
  contact,
  isDriver,
  verified,
  verifiedText,
}) => (
  <View style={styles.profileHeader}>
    <Image source={{ uri: picture }} style={styles.profilePicture} />
    <View style={styles.profileInfo}>
      <Text style={styles.profileName}>{name}</Text>
      {isDriver ? (
        <Text
          style={styles.profileNumber}
          onPress={() => Linking.openURL(`tel:${contact}`)}
        >
          {contact}
        </Text>
      ) : (
        <Text style={styles.profileEmail}>{contact}</Text>
      )}
      <View style={styles.profileVerified}>
        {verified ? (
          <Icon.Ionicons
            name={
              Platform.OS === 'ios'
                ? 'ios-checkmark-circle'
                : 'md-checkmark-circle'
            }
            size={26}
            color={Colors.checkmark}
          />
        ) : isDriver ? (
          <Icon.Ionicons
            name={Platform.OS === 'ios' ? 'ios-star' : 'md-star'}
            size={26}
            color={Colors.star}
          />
        ) : (
          <Icon.Ionicons
            name={
              Platform.OS === 'ios' ? 'ios-close-circle' : 'md-close-circle'
            }
            size={26}
            color={Colors.close}
          />
        )}
        <Text style={styles.profileVerifiedText}>{verifiedText}</Text>
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  profileHeader: {
    flex: 2,
    flexDirection: 'row',
    marginBottom: 10,
  },
  profileInfo: {
    flex: 1,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '500',
    marginTop: 5,
  },
  profileEmail: {
    fontSize: 16,
    fontWeight: '300',
  },
  profileNumber: {
    fontSize: 16,
    fontWeight: '300',
    color: Colors.number,
  },
  profileVerified: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileVerifiedText: {
    marginLeft: 5,
    fontWeight: '400',
  },
})

Profile.propTypes = {
  /**
   * Profile picture
   */
  picture: PropTypes.string.isRequired,
  /**
   * Profile name
   */
  name: PropTypes.string,
  /**
   * Profile contact method
   */
  contact: PropTypes.string,
  /**
   * Determines if driver or rider
   */
  isDriver: PropTypes.bool,
  /**
   * Determines if verified via mobile
   */
  verified: PropTypes.bool,
  /**
   * Text displayed next to verified status/star rating
   */
  verifiedText: PropTypes.string,
}

Profile.defaultProps = {
  name: 'John',
  contact: '(555)555-5555',
  isDriver: false,
  verified: false,
  verifiedText: 'Unverified',
}

export default Profile
