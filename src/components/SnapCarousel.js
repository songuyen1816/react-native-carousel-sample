import { View, Dimensions, Animated, FlatList, StyleSheet } from 'react-native'
import React, { useEffect, useRef } from 'react'

const width = Dimensions.get('window').width

var itemSize = width * 0.7
var spacing = 5
var offset = 0
var currentItem = 0
var dotSize = 0
var dotSelectedColor = ""
var dotUnSelectedColor = ""
const data = []
const scrollX = new Animated.Value(0)

var interval = null

/**
 * @param {{itemSize: Number, 
 * spacing: Number, 
 * data: Array, 
 * style: StyleSheet, 
 * renderItem: Function, 
 * onItemSnapped: Func,
 * keyExtractor: Func,
 * showIndicator: Boolean,
 * indicatorSpacing: Number,
 * dotSize: Number,
 * dotSelectedColor: String,
 * dotUnSelectedColor: String,
 * autoScroll: Boolean,
 * autoScrollInterval: Number
 * }} props 
 */
const SnapCarousel = (props) => {

    const flatListRef = useRef(null)

    itemSize = props.itemSize
    spacing = props.spacing
    offset = (width - itemSize) / 2

    if (props.showIndicator) {
        dotSize = props.dotSize ? props.dotSize : 6
        dotSelectedColor = props.dotSelectedColor ? props.dotSelectedColor : "#bdc3c7"
        dotUnSelectedColor = props.dotUnSelectedColor ? props.dotUnSelectedColor : "#7f8c8d"
    }

    data.splice(0, data.length)
    if (props.data) {
        data.push({ key: 'leftOffset' })
        data.push(...props.data)
        data.push({ key: 'rightOffset' })
    }

    useEffect(() => {
        if (props.autoScroll) {
            interval = setInterval(() => {
                if (Math.round((scrollX.__getValue()) % itemSize < 10)) {
                    console.log("auto scroll")
                    if (currentItem == props.data.length - 1) {
                        currentItem = 0
                    } else {
                        currentItem++
                    }
                    flatListRef.current.scrollToOffset({
                        animated: true,
                        offset: currentItem * itemSize
                    })
                }
            }, props.autoScrollInterval ? props.autoScrollInterval : 3000)
        }
        return () => {
            if (props.autoScroll) {
                clearInterval(interval)
            }
        }
    }, [])

    return (
        <View style={[props.style, { flexDirection: 'column' }]}>
            <FlatList
                ref={flatListRef}
                contentContainerStyle={{ alignItems: 'center' }}
                horizontal={true} showsHorizontalScrollIndicator={false}
                data={data}
                keyExtractor={props.keyExtractor}
                renderItem={({ item, index }) => {
                    return (index === 0 || index === data.length - 1)
                        ? renderOffset()
                        : renderItem(item, index, props.renderItem(item, index))
                }}
                onScroll={onScroll}
                snapToInterval={itemSize}
                pagingEnabled
                onMomentumScrollEnd={(e) => { onScrollEnd(e, props) }}
                disableIntervalMomentum={true}
                overScrollMode='never'
            />
            {props.showIndicator ?
                <View style={[{
                    height: props.dotSize,
                    marginTop: props.indicatorSpacing ? props.indicatorSpacing : 10
                }, styles.dotContainer]} >
                    {data.map((item, index) => {
                        return (index === 0 || index === data.length - 1)
                            ? null : renderIndicator(item, index)
                    })}
                </View>
                : null}
        </View>
    )
}

const onScroll = (e) => {
    scrollX.setValue(e.nativeEvent.contentOffset.x)
}

const onScrollEnd = (e, props) => {
    var currentNextItem = Math.round((e.nativeEvent.contentOffset.x) / itemSize)
    if (currentNextItem !== currentItem) {
        currentItem = currentNextItem
        props.onItemSnapped(currentItem)
    }
}

const renderOffset = () => {
    return <View style={{ width: offset }} />
}

const renderItem = (item, index, itemView) => {
    const inputRange = [
        (index - 2) * itemSize,
        (index - 1) * itemSize,
        index * itemSize,
    ];

    const scaleY = scrollX.interpolate({
        inputRange,
        outputRange: [0.9, 1, 0.9],
        extrapolate: 'clamp',
    });

    const scaleX = scrollX.interpolate({
        inputRange,
        outputRange: [0.9, 1, 0.9],
        extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.6, 1, 0.6],
        extrapolate: 'clamp'
    })

    return <Animated.View style={{ width: itemSize, height: '100%', transform: [{ scaleX }, { scaleY }], opacity: opacity }}>
        <View style={{ marginHorizontal: spacing }}>
            {itemView}
        </View>
    </Animated.View>
}

const renderIndicator = (item, index) => {
    const inputRange = [
        (index - 2) * itemSize,
        (index - 1) * itemSize,
        index * itemSize,
    ];

    const indicatorWidth = scrollX.interpolate({
        inputRange,
        outputRange: [dotSize, dotSize * 2.3, dotSize],
        extrapolate: 'clamp',
    });

    const color = scrollX.interpolate({
        inputRange,
        outputRange: [dotUnSelectedColor, dotSelectedColor, dotUnSelectedColor],
        extrapolate: 'clamp'
    });

    return <Animated.View style={{
        width: indicatorWidth,
        height: dotSize,
        borderRadius: dotSize / 2,
        backgroundColor: color,
        marginHorizontal: dotSize / 2,
    }} />
}

const styles = StyleSheet.create({
    dotContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default SnapCarousel
