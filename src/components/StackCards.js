import { View, Dimensions, Animated, FlatList, StyleSheet, PanResponder, Easing } from 'react-native'
import React, { useEffect, useRef, useState, memo } from 'react'
import { elementsThatOverlapOffsets } from 'react-native/Libraries/Lists/VirtualizeUtils'

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

const data = []

/**
 * @param {{
 * data: Array, 
 * style: StyleSheet, 
 * containerStyle: StyleSheet,
 * renderItem: Function, 
 * onItemSnapped: Func,
 * }} props 
 */
const StackCards = (props) => {

    data.splice(0, data.length)
    data.push(...props.data)

    const [scrollY, setScrollY] = useState({
        dy: 0,
        velocity: 0
    })
    const [onRelease, setOnRelease] = useState({
        release: false,
        velocity: 0
    })
    const [currentItem, setCurrentItem] = useState(0)
    const [position, setPosition] = useState({
        x: undefined,
        y: undefined
    })

    const [isAnimating, setIsAnimating] = useState(false)


    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onPanResponderMove: (evt, gestureState) => {
                if (gestureState.dy === 0) {
                    setOnRelease({ release: false, velocity: 0 })
                }
                setScrollY({
                    dy: gestureState.dy,
                    velocity: gestureState.vy
                })

            },
            onPanResponderRelease: (evt, gestureState) => {
                setOnRelease({ release: true, velocity: Math.abs(gestureState.vy) })
            }
        })
    ).current

    const onIndexChanged = (index) => {
        setScrollY({
            dy: 0,
            velocity: 0
        })
        setCurrentItem(index)
        setIsAnimating(false)
    }

    const onAnimating = () => {
        setIsAnimating(true)
    }

    const renderCardItems = (parentPosition) => {
        if (parentPosition.x != undefined) {
            return <View style={{ width: '100%', flex: 1 }} >
                {
                    data.reverse().map((item, index) => {
                        return <CardItem containerStyle={props.containerStyle}
                            key={data.length - 1 - index}
                            itemView={props.renderItem(item, data.length - 1 - index)}
                            parentPosition={parentPosition}
                            scrollY={scrollY}
                            index={data.length - 1 - index}
                            total={data.length}
                            currentIndex={currentItem} onRelease={onRelease}
                            onIndexChanged={onIndexChanged}
                            onAnimating={onAnimating}
                        />
                    })
                }
            </View>
        } else {
            return null
        }
    }

    return (
        <View  {...panResponder.panHandlers} pointerEvents={isAnimating ? 'none' : 'auto'} style={[props.style]} onLayout={(e) => {
            setPosition({
                x: e.nativeEvent.layout.x,
                y: e.nativeEvent.layout.y
            })
        }}>
            {renderCardItems(position)}
        </View>
    )
}

const CardItem = memo(({ itemView,
    scrollY,
    index,
    currentIndex,
    containerStyle,
    parentPosition,
    onRelease,
    total,
    onIndexChanged,
    onAnimating }) => {


    const screenOffPoint = height - parentPosition.y
    const centerPoint = (screenOffPoint) / 2

    const scrollYAnimated = useRef(new Animated.Value(0)).current

    const isPreviousIndex = index === currentIndex - 1
    const isNextIndex = index === currentIndex + 1
    const isCurrentIndex = index === currentIndex
    const isAnimatingView = isNextIndex || isPreviousIndex || isCurrentIndex

    var scaleX, scaleY, translateY

    switch (index) {
        case currentIndex:
            scaleX = scrollYAnimated.interpolate({
                inputRange: [-centerPoint, 0],
                outputRange: [0.7, 1],
                extrapolate: 'clamp'
            })

            scaleY = scrollYAnimated.interpolate({
                inputRange: [-centerPoint, 0],
                outputRange: [0.7, 1],
                extrapolate: 'clamp'
            })

            translateY = scrollYAnimated.interpolate({
                inputRange: [5, 50, centerPoint],
                outputRange: [0, 50, screenOffPoint],
                extrapolate: 'clamp'
            })

            break;
        case currentIndex + 1:
            scaleX = scrollYAnimated.interpolate({
                inputRange: [0, centerPoint],
                outputRange: [0.7, 1],
                extrapolate: 'clamp'
            })
            scaleY = scrollYAnimated.interpolate({
                inputRange: [0, centerPoint],
                outputRange: [0.7, 1],
                extrapolate: 'clamp'
            })
            translateY = scrollYAnimated.interpolate({
                inputRange: [-centerPoint, 0, centerPoint],
                outputRange: [0, 0, 0],
                extrapolate: 'clamp'
            })
            break;

        case currentIndex - 1:
            scaleX = scrollYAnimated.interpolate({
                inputRange: [0, centerPoint],
                outputRange: [1.0, 1.1],
                extrapolate: 'clamp'
            })
            scaleY = scrollYAnimated.interpolate({
                inputRange: [0, centerPoint],
                outputRange: [1.0, 1.1],
                extrapolate: 'clamp'
            })

            translateY = scrollYAnimated.interpolate({
                inputRange: [-centerPoint, -50],
                outputRange: [0, screenOffPoint],
                extrapolate: 'clamp'
            })
            break;

    }


    useEffect(() => {
        if (onRelease.release && scrollYAnimated.__getValue() != 0) {
            var valueTo
            if (isCurrentIndex) {
                if (scrollY.velocity < -0.5 && scrollYAnimated.__getValue() < 0) {
                    valueTo = -centerPoint
                }
                else if (scrollYAnimated.__getValue() > 0 && scrollY.velocity > 0.5) {
                    valueTo = centerPoint
                } else {
                    valueTo = 5
                }
            } else if (isNextIndex) {
                if (scrollY.velocity < 0.5) {
                    valueTo = -100
                } else {
                    valueTo = centerPoint
                }
            } else if (isPreviousIndex) {
                if (scrollY.velocity < -0.5) {
                    valueTo = -centerPoint
                } else {
                    valueTo = 5
                }
            }

            if(isAnimatingView){
                Animated.spring(scrollYAnimated, {
                    toValue: valueTo,
                    useNativeDriver: true,
                }).start()
            }

            if (currentIndex == index) {
                if (valueTo === centerPoint && index + 1 < total) {
                    onAnimating()
                    setTimeout(() => {
                        onIndexChanged(index + 1)
                    }, 100)

                } else if (valueTo === -centerPoint && index - 1 >= 0) {
                    onAnimating()
                    setTimeout(() => {
                        onIndexChanged(index - 1)
                    }, 100)
                }
            }
        }
    }, [onRelease])

    useEffect(() => {
        if (scrollY.velocity < 2 && total > 1) {
            if (isAnimatingView && Math.abs(scrollYAnimated.__getValue() - scrollY.dy) >= 0.5) {
                if (currentIndex === total - 1) {
                    scrollYAnimated.setValue(scrollY.dy <= 0 ? scrollY.dy : 0)
                } else if (currentIndex === 0) {
                    scrollYAnimated.setValue(scrollY.dy >= 0 ? scrollY.dy : 0)
                } else {
                    scrollYAnimated.setValue(scrollY.dy)
                }
            }
        }
    }, [scrollY])

    return <Animated.View style={[{ width: isAnimatingView ? '100%' : '0%', height: isAnimatingView ? '100%' : '0%', position: 'absolute', transform: isAnimatingView ? [{ scaleX }, { scaleY }, { translateY }] : [] }]}>
        <View style={[{ width: '100%', height: '100%' }, containerStyle]}>
            {itemView}
        </View>
    </Animated.View>
})


export default StackCards
