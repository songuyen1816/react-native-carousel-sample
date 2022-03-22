import { StyleSheet, Text, View, ScrollView, Animated } from 'react-native'
import React, { useRef } from 'react'
import CommonStyles from '../styles/CommonStyles'

/**
 * @param {{
 * renderItem: Function, 
 * data: Array,
 * onItemSnapped: Func,
 * style: StyleSheet
 * }} props 
 */
const VerticalSwipeCards = (props) => {
  const scrollViewRef = useRef(null)

  return (
    <View style={[props.style]}>
      <ScrollView ref={scrollViewRef} style={CommonStyles.debugBorder} showsVerticalScrollIndicator={false}>
        {props.data.reverse().map((item, index) => {
          return renderItem({ itemView: props.renderItem(item, index), index: index })
        })}
      </ScrollView>
    </View>
  )
}

const renderItem = ({ itemView, index }) => {
  console.log('item ok')
  return <Animated.View style={{ width: 100, height: 100, padding: 10 }}>
    {itemView}
  </Animated.View>
}

export default VerticalSwipeCards

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderColor: 'green',
    overflow: 'hidden',
    borderWidth: 1
  }
})