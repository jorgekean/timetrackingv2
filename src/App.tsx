
import { useRoutes } from 'react-router-dom'
import { debounce } from 'lodash';
import './App.css'
import AdminLayout from './components/layouts/AdminLayout'
import Content from './components/layouts/Content'
import routes from './route'
import { useEffect } from 'react'
import { SettingModel } from './models/SettingModel'
import { ErrorModel } from './models/ErrorModel'
import DexieUtils from './utils/dexie-utils'

function App() {
  const content = useRoutes(routes)

  const settingsDB = DexieUtils<SettingModel>({
    tableName: "settings",
  })
  const errorDB = DexieUtils<ErrorModel>({
    tableName: "fuse-logs",
  })

  // Settings initial data
  const fuseSettingsInitialData: SettingModel[] = [
    {
      type: "copytimesheet",
      value: false,
    },
    {
      type: "timezone",
      value: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    {
      type: "decimalmark",
      value: true,
    },
    {
      type: "worklocation",
      value: "",
    },
  ]

  useEffect(() => {
    const handleSettings = debounce(async () => {
      try {
        const storedSettings = await settingsDB.getAll();

        for (const initialSetting of fuseSettingsInitialData) {
          const existingSetting = storedSettings.find(
            (setting) => setting.type === initialSetting.type
          );
          if (!existingSetting) {
            await settingsDB.add(initialSetting);
          }
        }
      } catch (error: any) {
        console.error("Error while syncing settings:", error);
      }
    }, 500); // Debounce with 500ms delay

    handleSettings(); // Execute the function

    return () => {
      handleSettings.cancel(); // Cleanup debounce on unmount or re-run
    };
  }, [settingsDB]); // This runs when settingsDB changes

  return (
    <AdminLayout>
      <Content>
        {content}
      </Content>
    </AdminLayout>
  )
}

export default App
