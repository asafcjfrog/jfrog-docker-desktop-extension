import { styled, TextField, Stack, Box, FormLabel, FormControlLabel, Radio, RadioGroup, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { ExtensionConfig } from '../types';
import { useHistory } from 'react-router-dom';
import { SettingsForm } from '../utils/Settings';
import { Load, Save } from '../utils/config';
import { BASIC_AUTH } from '../utils/constants';
import { Policy } from '../types/policy';
import { LoadingButton } from '@mui/lab';
import Loader from '../components/Loader';
import { JfrogHeadline } from '../components/JfrogHeadline';

export const SettingsPage = () => {
  let history = useHistory();
  const [isWindowLoading, setWindowLoading] = useState(true);
  const [isButtonLoading, setButtonLoading] = useState(false);
  const [state, setValue] = useState<ExtensionConfig>({ authType: BASIC_AUTH });
  const [policy, setPolicy] = useState<Policy>(Policy.Vulnerabilities);

  useEffect(() => {
    if (isWindowLoading) {
      Load()
        .then((config) => {
          setValue(config);
          if (config.project) {
            setPolicy(Policy.Project);
          }
          if (config.watches) {
            setPolicy(Policy.Watches);
          }
          setWindowLoading(false);
        })
        .finally(() => {
          setWindowLoading(false);
        });
    }
  });

  const HandleCancel = () => {
    history.push('/scan');
  };

  const HandleSave = async () => {
    setButtonLoading(true);
    if (policy === Policy.Vulnerabilities || policy === Policy.Project) {
      state.watches = undefined;
    }
    if (policy === Policy.Vulnerabilities || policy === Policy.Watches) {
      state.project = undefined;
    }

    if (await Save(state)) {
      history.push('/scan');
    } else {
      setButtonLoading(false);
    }
  };

  return (
    <>
      {isWindowLoading ? (
        <Loader />
      ) : (
        <>
          <Wrapper>
            <Box flexGrow={1} overflow={'auto'}>
              <Box maxWidth={'400px'}>
                <Box>
                  {/* <Button variant="text" >
          <ArrowBackIosNew />
        </Button> */}
                  <Box
                    sx={{
                      fontFamily: 'Open Sans',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      fontSize: '30px',
                      color: '#414857',
                    }}
                  >
                    <JfrogHeadline headline="JFrog Settings" />
                  </Box>
                </Box>
                <Stack spacing={1}>
                  <Box
                    sx={{
                      fontFamily: 'Roboto',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '16px',
                      color: '#414857',
                      marginTop: '25px',
                    }}
                    id="demo-radio-buttons-group-label"
                  >
                    JFrog platform connection details
                  </Box>
                  {SettingsForm(state, setValue)}
                </Stack>
                {/* <Box marginTop={6}/> */}
                <Box marginBottom={'30px'}>
                  <Box marginTop={6}>
                    <FormLabel id="demo-radio-buttons-group-label">Scanning policy</FormLabel>
                  </Box>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue={policy}
                    name="radio-buttons-group"
                  >
                    <FormControlLabel
                      value="allVulnerabilities"
                      onChange={() => {
                        setPolicy(Policy.Vulnerabilities);
                      }}
                      control={<Radio />}
                      label="All Vulnerabilities"
                    />
                    <FormControlLabel
                      value="project"
                      onChange={() => {
                        setPolicy(Policy.Project);
                      }}
                      control={<Radio />}
                      label="JFrog Project"
                    />
                    <Box ml={4}>
                      <TextField
                        disabled={policy !== Policy.Project}
                        placeholder="Project Name"
                        defaultValue={state.project}
                        onChange={(e: any) => setValue({ ...state, project: e.target.value })}
                        size="small"
                        id="project"
                      />
                    </Box>
                    <FormControlLabel
                      value="watches"
                      onChange={() => {
                        setPolicy(Policy.Watches);
                      }}
                      control={<Radio />}
                      label="Watches"
                    />
                    <Box ml={4}>
                      <TextField
                        disabled={policy !== Policy.Watches}
                        placeholder="watch1,watch2,..."
                        defaultValue={state.watches}
                        onChange={(e: any) => setValue({ ...state, watches: e.target.value })}
                        size="small"
                        id="watches"
                      />
                    </Box>
                  </RadioGroup>
                </Box>
              </Box>
            </Box>

            <Footer>
              <LoadingButton type="submit" loading={isButtonLoading} onClick={HandleSave} variant="contained">
                Save
              </LoadingButton>
              <Button variant="outlined" onClick={HandleCancel}>
                Cancel
              </Button>
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

const Footer = styled(Box)`
  border-top: 1px solid #ccc;
  padding: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
`;