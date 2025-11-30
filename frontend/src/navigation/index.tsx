import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HeaderButton, Text } from "@react-navigation/elements";
import {
  createStaticNavigation,
  StaticParamList,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons"

import { Profile } from "./screens/Profile";
import { Settings } from "./screens/Settings";
import { NotFound } from "./screens/NotFound";
import LoginScreen from "./screens/Login";
import DashboardScreen from "@/src/navigation/screens/Dashboard"
import MedicineScreen from "@/src/navigation/screens/Medicine"
import FamilyScreen from "@/src/navigation/screens/family"

const DashboardTabs = createBottomTabNavigator({
  screens: {
    Dashboard: {
      screen: DashboardScreen,
      options: {
        title: "Inicio",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home-outline" className="-mb-[2px]" size={18} color={color} />
        ),
      },
    },
    Medicines: {
      screen: MedicineScreen,
      options: {
        title: "Medicamentos",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="medkit-outline" className="-mb-[3px]" size={18} color={color} />
        ),
      },
    },
    Family: {
      screen: FamilyScreen,
      options: {
        title: "Família",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="people-outline" className="-mb-[3px]" size={18} color={color} />
        ),
      },
    },
  },
})


const RootStack = createNativeStackNavigator({
  initialRouteName: "Login",
  screens: {
    Login: {
      screen: LoginScreen,
      options: {
        headerShown: false, 
      },
    },
    Home: {
      screen: DashboardTabs,
      options: {
        headerShown: false,
      },
    },
    Profile: {
      screen: Profile,
      linking: {
        path: ":user(@[a-zA-Z0-9-_]+)",
        parse: {
          user: (value) => value.replace(/^@/, ""),
        },
        stringify: {
          user: (value) => `@${value}`,
        },
      },
    },
    Settings: {
      screen: Settings,
      options: ({ navigation }) => ({
        presentation: "modal",
        title: "Configurações",
      }),
    },
    NotFound: {
      screen: NotFound,
      options: {
        title: "404",
      },
      linking: {
        path: "*",
      },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);

export type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
