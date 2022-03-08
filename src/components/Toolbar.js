import { StyleSheet, Text, View, Platform } from 'react-native'
import React from 'react'
import CommonStyles from '../styles/CommonStyles'

const Toolbar = (props) => {
  return (
    <View style={[CommonStyles.debugBorder, styles.container]}>
      <Text>{props.title}</Text>
    </View>
  )
}

export default Toolbar

const styles = StyleSheet.create({
    container:{
        width: '100%',
        height: Platform.OS === 'ios' ? 90 : 55,
        justifyContent: 'center',
        alignItems: 'center',
    }
})