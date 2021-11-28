import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import {TabBar} from '../../components/Header';
import {useNavigation} from '@react-navigation/core';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import { student, tutor } from '../../styles/Color';
import {setToken, setProfile, setUserType} from '../../services/asyncStorage/AsyncStorage';
import APIKit from '../../services/ApiKit';
import { useUserContext } from '../../../UserContext';

const ConfirmOTP = ({route, navigation}) => {
  // const navigation = useNavigation();
  const [username, setUsername] = useState("test name");
  const [loading, setLoading] = useState(false);
  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(0);
  const [code_, setcode] = useState();
  const [err, setErr] = useState();

  const useContext = useUserContext();


  useEffect(() => {
    let myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(myInterval);
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }
    }, 1000);
    return () => {
      clearInterval(myInterval);
    };
  }, [minutes, seconds]);

  const confirmOTP = code => {
    // navigation.navigate('Main');
    // useContext.setData({userType: "STUDENT", profPic: "assets/images/ic-user.png"})
    setErr()
    setcode(code)
    setLoading(true)
      let body = {
        "mobile": route.params.phone,
        "otp": code,
        "device_name": "temporibus"
        };
      let body_ = {
        "mobile":"1074574665",
        "otp": "5708",
        "device_name": "temporibus"
        };

    APIKit.post('/sanctum/token', body).then(res => {
      console.log(res.data);
      if (res.status == 200) {
       let data = res.data;
        console.log('login success', data);
        if( data.message == "User not exists"){
               navigation.navigate("TellUs", {phone : route.params.phone})
        }else{
          data = data.data
          console.log('login success', "user exis", data.user);
          setToken(data.token);
          setProfile(JSON.stringify(data.user));
          setUserType(data.user.role.toUpperCase());
          useContext.setData({...useContext.data, userType: data.user.role.toUpperCase(), prof:{name: data.user.name, pic: "new tutor url"}});
        }
        setLoading(false)
      } else {
        // alert("")
        console.log('err catch', res.data);
        setErr(res?.data.errors.mobile[0])
       setLoading(false)

      }
    });

  };

  const resendOTP = _ => {
    setLoading(true);
    APIKit.post(`Customer_Signup/signup_otp_resend`, {
      username: username,
    })
      .then(data => {
        setMinutes(3);
        console.log('data ---------', data);
        showToast('OTP sended successfully');
        setLoading(false);
      })
      .catch(error => {
        console.log(error);
        setLoading(false);
      });
  };

  return (
    <Layout>
      <TabBar title="OTP Verify"
      />
      <View style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : null}>
            <Text
              style={{
                color: '#444',
                fontSize: 20,
                marginTop: 50,
                fontWeight: 'bold'
              }}>
             Verify Your {'\n'}Phone Number
            </Text>
            <Text
              style={{
                color: '#444',
                fontSize: 14,
              }}>
            Enter your OTP code here
            </Text>
            <Text>SAMPLE OTP ------ {route.params.otpSample}</Text>

            <OTPInputView
              style={{width: '100%', height: 100}}
              pinCount={4}
              // code={this.state.code} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
              onCodeChanged={code => {
                // setLoading(true);
                // setcode(code)
              }}
              autoFocusOnLoad
              codeInputFieldStyle={styles.underlineStyleBase}
              codeInputHighlightStyle={styles.underlineStyleHighLighted}
              onCodeFilled={code => {
                confirmOTP(code);
              }}
            />
            {err && <Text style={{color: 'tomato'}}>! {err}</Text>}

            <View style={styles.timer}>
              {minutes === 0 && seconds === 0 ? (
                <TouchableOpacity
                  onPress={() => resendOTP()}
                  style={{
                    alignItems: 'center',
                    marginTop: 20,
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      color: '#000',
                      opacity: 0.6,
                    }}>
                    Didn't Recieve OTP!
                  </Text>
                  <Text style={styles.resendOtp}> Resend </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                </Text>
              )}
            </View>
          </KeyboardAvoidingView>

          <View
            style={{
              marginVertical: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>

              {loading ? <ActivityIndicator loading={true} color={student} /> : 
            <Button
              title="Next"
              buttonContainerStyle={{margin: 10, marginVertical: 60}}
              onPress={() => confirmOTP()}
              // onPress={() => navigation.navigate("TellUs")}
              disabled={loading}
              loading={loading}
              loadingColor="#000"
              buttonContainerStyle={{}}
              style={{padding: 10, paddingHorizontal: 50}}
            />}
          </View>
      </View>
    </Layout>
  );
};

export default ConfirmOTP;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'flex-end',
    // height: height /1.11,
    margin: 20,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  form: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  header: {
    fontSize: 18,
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  checkbox: {
    alignSelf: 'center',
  },
  label: {
    margin: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: '#ccc',
    marginVertical: 20,
    opacity: 0.7,
  },
  err: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: 'red',
    opacity: 0.7,
  },
  logo: {
    alignSelf: 'center',
    margin: 10,
    marginTop: 20,
    width: 100,
    height: 100,
  },
  timer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: student,
  },
  borderStyleHighLighted: {},
  underlineStyleBase: {
    width: 45,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 3,
    borderColor: student,
    elevation: 10,
    shadowColor: 'rgba(0,0,0, 0.4)',
    borderRadius: 5,
    margin: 5,
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: '#fff',
    color: student,
  },
  underlineStyleHighLighted: {
    color: student,
    // backgroundColor: primaryColor,
  },
  resendOtp: {
    color: student,
    fontSize: 18,
    marginVertical: 5,
  },
});
