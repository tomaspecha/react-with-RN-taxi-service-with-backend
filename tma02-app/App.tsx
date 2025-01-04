/**
 * TM352 23J TMA02 Q1, code
 *
 * 26/10/2023 Intial version Chris Thomson
 * 14/12/2023 Line 74 modified to getDate rather than getDay Chris Thomson
 *
 * This is the main application code for the React Native application.
 * It is a simple application that allows a user to register a userid
 * and then make a taxi request or offer.
 *
 * The application uses the Expo framework to provide access to the
 * device GPS and to provide a simple UI.
 *
 * The application uses the TaxiService library to access the taxi
 * service API.
 *
 * The application uses the NominatimService library to access the
 * Nominatim service to lookup the address of the current GPS location.
 *
 * The application uses the TimePicker, AddressPicker and WaitTime
 * components to provide a simple UI.
 **/
import {
    Button,
    GestureResponderEvent,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import {useState, useEffect} from 'react';
import TimePicker from './components/TimePicker';
import AddressPicker from './components/AddressPicker';
import WaitTime from './components/WaitTime';
import * as Taxi from './libraries/TaxiService';
import * as Location from 'expo-location';

/**
 * Requests user permission to get the GPS location of the device.
 * This needs to be called before the GPS is read.
 *
 * @returns true if permission is granted, otherwise throws an error.
 */
async function getUserPermission(): Promise<boolean> {
    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        throw new Error(
            'Permission to access location was denied. Please check your device settings.'
        );
    }
    return true;
}

export default function App() {
    const [ownerAddress, setOwnerAddress] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [ownerHours, setOwnerHours] = useState('0');
    const [ownerMinutes, setOwnerMinutes] = useState('0');
    const [ownerMatches, setOwnerMatches] = useState('');
    const [customerHours, setCustomerHours] = useState('0');
    const [customerMinutes, setCustomerMinutes] = useState('0');
    const [ownerWait, setOwnerWait] = useState('0');
    const [userid, setUserid] = useState('');
    const [ownerOrderid, setOwnerOrderid] = useState('');
    const [customerMatches, setCustomerMatches] = useState('');

    useEffect(() => {
        (async () => {
            try {
                await getUserPermission();
            } catch (error) {
                console.error(error.message);
            }
        })();
    }, []);

    const getOwnerData = async () => {
        const location = await Location.getCurrentPositionAsync({});
        setOwnerAddress('Location found');
    };

    const transportOwnerMake = async () => {
        const now = new Date();
        const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            parseInt(ownerHours),
            parseInt(ownerMinutes)
        );
        const end = new Date(start.getTime() + parseInt(ownerWait) * 60000);

        const order = await Taxi.postOrders(
            userid,
            start.toISOString(),
            end.toISOString(),
            '0',
            ownerAddress
        );
        setOwnerOrderid(order.id);
    };

    const transportOwnerCancel = async () => {
        if (ownerOrderid) {
            await Taxi.deleteOrders(userid, ownerOrderid);
        }
        setOwnerOrderid('');
    };

    const transportOwnerMatches = async () => {
        const matches = await Taxi.getMatches(userid);
        setOwnerMatches(JSON.stringify(matches));
    };

    const transportCustomerMatches = async () => {
        const matches = await Taxi.getMatches(userid);
        setCustomerMatches(JSON.stringify(matches));
    };

    // The UI for the application
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.paragraph}>Owner Offer</Text>
            <AddressPicker
                label="Waiting address"
                address={ownerAddress}
                onClick={getOwnerData}
                onChangeAddress={setOwnerAddress}
            />
            <TimePicker
                label="Start to wait at (24hrs)"
                hours={ownerHours}
                minutes={ownerMinutes}
                onChangeHours={setOwnerHours}
                onChangeMinutes={setOwnerMinutes}
            />
            <WaitTime
                label="Wait time (minutes)"
                minutes={ownerWait}
                onChangeMinutes={setOwnerWait}
            />
            <View style={styles.hcontainer}>
                <Button title="Make" onPress={transportOwnerMake}/>
                <Button title="Cancel" onPress={transportOwnerCancel}/>
                <Button title="Matches" onPress={transportOwnerMatches}/>
            </View>
            <Text style={styles.matches}>Matches: {ownerMatches}</Text>

            <Text style={styles.paragraph}>Customer Request</Text>
            <AddressPicker
                label="Pickup address"
                address={customerAddress}
                onChangeAddress={setCustomerAddress} onClick={function (event: GestureResponderEvent): void {
                throw new Error('Function not implemented.');
            }}            />
            <TimePicker
                label="Pickup time (24hrs)"
                hours={customerHours}
                minutes={customerMinutes}
                onChangeHours={setCustomerHours}
                onChangeMinutes={setCustomerMinutes}
            />
            <View style={styles.hcontainer}>
                <Button title="Make" onPress={() => {}} />
                <Button title="Cancel" onPress={() => {}} />
                <Button title="Matches" onPress={transportCustomerMatches} />
            </View>
            <Text style={styles.matches}>Matches: {customerMatches}</Text>

            <Text style={styles.paragraph}>Login</Text>
            <View style={styles.hcontainer}>
                <TextInput
                    style={styles.input}
                    value={userid}
                    onChangeText={setUserid}
                    placeholder="User ID"
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
        padding: 8,
    },
    hcontainer: {
        flexDirection: 'row',
        backgroundColor: '#ecf0f1',
        padding: 8,
        justifyContent: 'space-between',
    },
    paragraph: {
        margin: 24,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        padding: 5,
        width: 200,
    },
    matches: {
        margin: 24,
        fontSize: 12,
        textAlign: 'center',
    },
});
