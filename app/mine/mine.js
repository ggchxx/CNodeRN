'use strict'

import React,{Component} from "react"
import {View, Text, TouchableOpacity, Image, ListView,ScrollView, Animated,Alert} from "react-native"
import Icon from "react-native-vector-icons/FontAwesome"
import ScrollableTabView from "react-native-scrollable-tab-view"

import Tabs from "../common/component/tabs"
import Loading from "../common/component/loading"
import Anonymous from "../common/module/anonymous"
import NavBar from "../common/component/navbar"

import {formatTime} from "../lib/helper"
import containerByComponent from "../lib/redux-helper"
import {fetchUser} from "./action"
import {userReducer} from "./reducer"

import styles from "./stylesheet/mine"
import preferredThemeByName,{htmlStyle} from "../common/stylesheet/theme"

class Mine extends Component {
    constructor(props) {
        super(props)
        this.state = {
            topicDatasource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
                sectionHeaderHasChanged: (s1, s2) => s1 !== s2
            }),
            replyDatasource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
                sectionHeaderHasChanged: (s1, s2) => s1 !== s2
            }),
            isLogined:false
        }
        this._preferredTheme = preferredThemeByName(props.userPrefs["preferredTheme"])
        this._preferredHtmlStyle = htmlStyle[props.userPrefs["preferredTheme"]]
    }
    componentDidMount() {
        const {user} = this.props
        if(user){
            this.setState({isLogined:true})
            this.props.actions.fetchUser(user.username)
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.user && !nextProps.userFetching) {
            this.setState({
                topicDatasource: this.state.topicDatasource.cloneWithRows(nextProps.user.recent_topics),
                replyDatasource: this.state.topicDatasource.cloneWithRows(nextProps.user.recent_replies)
            })
        }
        if(nextProps.userPrefs && nextProps.userPrefs !== this.props.userPrefs){
            this._preferredTheme = preferredThemeByName(nextProps.userPrefs["preferredTheme"])
        }
    }
    renderBreif() {
        const {user} = this.props
        if (!user) {
            return null
        }
        return (
            <View style={styles.mineBreif}>
                <View style={styles.mineAuthorize}>
                    <Image source={{ uri: user.avatar_url }} style={styles.mineAvatar}/>
                    <Text style={styles.mineAuthorizeText}>{user.loginname}</Text>
                    <Text style={[styles.mineAuthorizeText, styles.mineAuthorizeSubtext]}>注册时间: <Text>{formatTime(user.create_at) }</Text></Text>
                </View>
            </View>
        )
    }
    renderNavigationBar() {
        const {navigationActions} = this.props
        const rightButton = (
            <TouchableOpacity style={styles.navigationBarButton} onPress={()=>navigationActions.pushScene("setup")}>
                <Icon name="cog" size={20} color="#999"/>
            </TouchableOpacity>
        )
        return <NavBar title="我的" leftButton={false} rightButton={()=>rightButton} userPrefs={this.props.userPrefs}/>
    }
    renderTopicRow(topic) {
        const {user,navigationActions} = this.props
        return (
            <TouchableOpacity onPress={()=>navigationActions.pushScene("topic",{ id: topic.id }) }>
                <Animated.View style={[styles.listCell,this._preferredTheme["topicCell"],{
                    // opacity: this.state.rowScale,
                    // transform: [{ scaleX: this.state.rowScale }]
                }]}>
                    <View style={styles.topicBreif}>
                        <Image source={{ uri: user.avatar_url }} style={styles.topicImage}/>
                        <View style={[styles.topicSubtitle]}>
                            <Text style={[styles.topicSubtitleText,this._preferredTheme["topicSubtitleText"]]}>{user.loginname}</Text>
                            <Text style={styles.topicMintitleText}>{topic.last_reply_at}</Text>
                        </View>
                    </View>
                    <View style={styles.topicTitle}>
                        <Text style={[styles.topicTitleText,this._preferredTheme["topicSubtitleText"]]} numberOfLines={2}>{topic.title}</Text>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        )
    }
    renderTrends() {
        const {user} = this.props
        if (!user) {
            return null
        }
        const renderTabs = ()=>{
            return (
                <Tabs style={[styles.mineTrendsTab,this._preferredTheme["tab"]]} 
                selectedStyle={[styles.mineTrendsSelectedTab,this._preferredTheme["selectedTab"]]}>
                    <Text style={styles.mineTrendsUnselectedTab} name="topic">最近主题</Text>
                    <Text style={styles.mineTrendsUnselectedTab} name="reply">最近回复</Text>
                </Tabs>
            )
        }
        return (
            <View style={styles.mineTrends}>
                <ScrollableTabView renderTabBar={renderTabs}>
                    <View style={styles.mineTrendsContent}>
                        <ListView dataSource={this.state.topicDatasource} renderRow={this.renderTopicRow.bind(this) } enableEmptySections={true} 
                            renderSeparator={(sectionId, rowId) => <View key={`${sectionId}-${rowId}`} style={[styles.cellSeparator,this._preferredTheme["cellSeparator"]]}/>}
                            />
                    </View>
                    <View style={styles.mineTrendsContent}>
                        <ListView dataSource={this.state.replyDatasource} renderRow={this.renderTopicRow.bind(this) } enableEmptySections={true} 
                            renderSeparator={(sectionId, rowId) => <View key={`${sectionId}-${rowId}`} style={[styles.cellSeparator,this._preferredTheme["cellSeparator"]]}/>}
                            />
                    </View>
                </ScrollableTabView>
            </View>
        )
    }
    render() {
        const loadingColor = this._preferredThemeDefines && this._preferredThemeDefines["loading"]?this._preferredThemeDefines["loading"].color:"#333"
        const {navigationActions} = this.props
        return (
            <View style={[styles.container,this._preferredTheme["container"]]}>
                {this.renderNavigationBar() }
                {!this.state.isLogined?<Anonymous toLogin={()=>navigationActions.pushScene("qrcode")}/>:this.props.userFetching?<Loading color={loadingColor}/>:(
                    <ScrollView>
                    {this.renderBreif() }
                    {this.renderTrends() }
                    </ScrollView>
                )}
            </View>
        )
    }
}

export default containerByComponent(Mine, userReducer, { fetchUser})
