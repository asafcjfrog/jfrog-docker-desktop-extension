import {
  styled,
  TextField,
  Stack,
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
  Typography,
  CircularProgress,
  Link,
  Tooltip,
} from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import { ExtensionConfig } from '../types';
import { useHistory } from 'react-router-dom';
import { Load, Save } from '../utils/config';
import { testJFrogPlatformConnection } from '../api/config';
import { ACCESS_TOKEN, BASIC_AUTH } from '../utils/constants';
import { Policy } from '../types/policy';
import { LoadingButton } from '@mui/lab';
import Loader from '../components/Loader';
import { JfrogHeadline } from '../components/JfrogHeadline';
import { CredentialsForm } from '../components/CredentialsForm/CredentialsForm';
import { ddToast, ddClient, isDevelopment, getVersions, Versions } from '../api/utils';
import EditIcon from '@mui/icons-material/Edit';
import UndoIcon from '@mui/icons-material/Undo';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import InfoIcon from '@mui/icons-material/Info';

export const SettingsPage = () => {
  const history = useHistory();
  const [extensionConfig, setExtensionConfig] = useState<ExtensionConfig>({ authType: BASIC_AUTH });
  const [oldExtensionConfig, setOldExtensionConfig] = useState<ExtensionConfig | undefined>(undefined);
  const [isWindowLoading, setWindowLoading] = useState(true);
  const [isButtonLoading, setButtonLoading] = useState(false);
  const [isEditConnectionDetails, setIsEditConnectionDetails] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [policy, setPolicy] = useState<Policy>(Policy.Vulnerabilities);
  const [oldPolicy, setOldPolicy] = useState<Policy>(Policy.Vulnerabilities);
  const [versions, setVersions] = useState<Versions>({});

  const fetchData = useCallback(async () => {
    const config: ExtensionConfig = await Load();
    setExtensionConfig(config);
    setOldExtensionConfig(config);
    if (config.project != undefined) {
      setPolicy(Policy.Project);
      setOldPolicy(Policy.Project);
    }
    if (config.watches != undefined) {
      setPolicy(Policy.Watches);
      setOldPolicy(Policy.Watches);
    }
    const versions = await getVersions();
    setVersions(versions);
  }, []);

  useEffect(() => {
    fetchData()
      .then(() => setWindowLoading(false))
      .catch(console.error);
  }, [fetchData]);

  const HandleCancel = () => {
    history.push('/scan');
  };

  const HandleSave = async () => {
    setButtonLoading(true);
    if (policy === Policy.Vulnerabilities || policy === Policy.Project) {
      extensionConfig.watches = undefined;
    }
    if (policy === Policy.Vulnerabilities || policy === Policy.Watches) {
      extensionConfig.project = undefined;
    }
    if (isEditConnectionDetails) {
      if (extensionConfig.authType === ACCESS_TOKEN) {
        extensionConfig.username = undefined;
        extensionConfig.password = undefined;
      } else {
        extensionConfig.accessToken = undefined;
      }
    } else {
      extensionConfig.password = undefined;
      extensionConfig.accessToken = undefined;
    }

    if (await Save(extensionConfig)) {
      history.push('/scan');
    } else {
      setButtonLoading(false);
    }
  };

  const HandleTestConnection = async () => {
    try {
      setIsTestingConnection(true);
      let res = await testJFrogPlatformConnection(isEditConnectionDetails ? extensionConfig : undefined);
      if (res.trim() == 'OK') {
        ddToast.success('Succesfully conntected to JFrog Environment');
      } else {
        ddToast.error('Could not connect to JFrog Environment: ' + res);
      }
      setIsTestingConnection(false);
    } catch (e) {
      ddToast.error('Could not connect to JFrog Environment: ' + e);
      setIsTestingConnection(false);
    }
  };

  const ShowJfrogDetails = () => {
    const settingsLine = (key: string, value: string | undefined, link?: string) => {
      return (
        <Box display="flex">
          <Typography marginLeft="10px" marginRight="20px">
            {key}
          </Typography>
          <Link onClick={link ? () => ddClient?.host?.openExternal(link) : undefined}>
            {value ?? <CircularProgress size="14px" color="success" />}
          </Link>
        </Box>
      );
    };
    return (
      <Stack spacing={2}>
        {settingsLine('Environment URL:', oldExtensionConfig?.url, oldExtensionConfig?.url)}
        {settingsLine(
          'Xray Version:',
          versions.xrayVersion,
          'https://www.jfrog.com/confluence/display/JFROG/Xray+Release+Notes#XrayReleaseNotes-Xray' +
            versions.xrayVersion
        )}
        {settingsLine(
          'CLI Version:',
          versions.jfrogCliVersion,
          'https://github.com/jfrog/jfrog-cli/releases/tag/v' + versions.jfrogCliVersion
        )}
      </Stack>
    );
  };

  const fullConnectionDetails =
    extensionConfig.url && ((extensionConfig.username && extensionConfig.password) || extensionConfig.accessToken);

  const policyChanged = () => {
    if (oldPolicy != policy) {
      // Policy changed
      return true;
    } else if (oldExtensionConfig?.watches != extensionConfig.watches) {
      // Same policy, different data
      return true;
    } else if (oldExtensionConfig?.project != extensionConfig.project) {
      // Same policy, different data
      return true;
    }
    return false;
  };

  const saveButtonDisabled = () => {
    if (isEditConnectionDetails) {
      return !fullConnectionDetails; //
    } else {
      return !policyChanged;
    }
  };

  return (
    <>
      {!isDevelopment && isWindowLoading ? (
        <SpinnerWrapper className="login-wrapper">
          <Loader />
        </SpinnerWrapper>
      ) : (
        <>
          <Wrapper>
            <Box>
              <JfrogHeadline headline="JFrog Environment Settings" marginBottom="50px" />
            </Box>
            <Box flexGrow={1} overflow={'auto'} width="420px">
              <Stack spacing={2}>
                <Typography variant="h1" fontWeight="400" fontSize="19px" id="JFrog Environment Connection Details">
                  JFrog Environment Connection Details
                </Typography>

                {isEditConnectionDetails
                  ? CredentialsForm(extensionConfig, setExtensionConfig, history, isButtonLoading)
                  : ShowJfrogDetails()}
                <Box>
                  <Button
                    color="success"
                    variant="contained"
                    startIcon={isEditConnectionDetails ? <UndoIcon /> : <ManageAccountsIcon />}
                    onClick={() => setIsEditConnectionDetails(!isEditConnectionDetails)}
                    sx={{ width: 'fit-content', marginRight: '20px' }}
                  >
                    {isEditConnectionDetails ? 'Back' : 'Edit Connection Details'}
                  </Button>
                  {isEditConnectionDetails && (
                    <LoadingButton
                      color="success"
                      disabled={!fullConnectionDetails}
                      loading={isTestingConnection}
                      variant="contained"
                      sx={{ width: 'fit-content' }}
                      onClick={HandleTestConnection}
                      endIcon={<CloudQueueIcon />}
                    >
                      Test Connection
                    </LoadingButton>
                  )}
                </Box>
              </Stack>

              <Box mt="35px">
                <Box display="flex" alignItems="center">
                  <Typography variant="h1" fontWeight="400" fontSize="19px" id="JFrog Environment Connection Details">
                    Scanning Policy
                  </Typography>
                  <Tooltip
                    placement="bottom"
                    arrow
                    title="Optionally use the Watches/Project fields to allow the security and license compliance information displayed on the scan results, to reflect the security policies required by your organization."
                  >
                    <InfoIcon sx={{ opacity: 0.5, marginLeft: '5px' }} />
                  </Tooltip>
                </Box>

                <RadioGroup
                  sx={{ marginLeft: '10px', marginTop: '10px' }}
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue={policy}
                  name="radio-buttons-group"
                >
                  <FormControlLabel
                    value="allVulnerabilities"
                    onChange={() => setPolicy(Policy.Vulnerabilities)}
                    control={<Radio />}
                    label="All Vulnerabilities"
                  />
                  <FormControlLabel
                    value="project"
                    onChange={() => setPolicy(Policy.Project)}
                    control={<Radio />}
                    label="JFrog Project"
                  />
                  <Box ml={4}>
                    {policy == Policy.Project && (
                      <TextField
                        placeholder="Project Name"
                        defaultValue={extensionConfig.project}
                        onChange={(e: any) => setExtensionConfig({ ...extensionConfig, project: e.target.value })}
                        size="small"
                        id="project"
                      />
                    )}
                  </Box>
                  <FormControlLabel
                    value="watches"
                    onChange={() => setPolicy(Policy.Watches)}
                    control={<Radio />}
                    label="Watches"
                  />
                  <Box ml={4}>
                    {policy == Policy.Watches && (
                      <TextField
                        placeholder="watch1,watch2,..."
                        defaultValue={extensionConfig.watches}
                        onChange={(e: any) => setExtensionConfig({ ...extensionConfig, watches: e.target.value })}
                        size="small"
                        id="watches"
                      />
                    )}
                  </Box>
                </RadioGroup>
              </Box>
            </Box>

            <Footer>
              <Button variant="outlined" onClick={HandleCancel}>
                Cancel
              </Button>
              <LoadingButton
                type="submit"
                disabled={saveButtonDisabled()}
                loading={isButtonLoading}
                onClick={HandleSave}
                variant="contained"
              >
                Save
              </LoadingButton>
            </Footer>
          </Wrapper>
        </>
      )}
    </>
  );
};

const Wrapper = styled(Box)`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
const SpinnerWrapper = styled(Box)`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Footer = styled(Box)`
  padding: 20px;
  padding-bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
`;
