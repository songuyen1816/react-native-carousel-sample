import { Text, StyleSheet, View } from 'react-native'
import React from 'react'
import TextType from '../constant/TextType'

/**
 * @param {{textType: TextType, 
 * style: StyleSheet
 * }} props 
 */
const AppText = (props) => {
  let fontType = props.textType === TextType.REGULAR ? styles.regular : styles.medium

  return (
    <View>
      <Text style={[fontType, props.style]}>{props.text}</Text>
    </View>
  )
}

export default AppText

const styles = StyleSheet.create({
  regular: {
    fontFamily: 'Barlow-Regular'
  },
  medium: {
    fontFamily: 'Barlow-Medium'
  }
})

