import { styled, TextField, Box, FormControlLabel, Radio, RadioGroup, Link, Typography, Stack } from '@mui/material';

import { RouteComponentProps } from 'react-router-dom';

import { Dispatch, SetStateAction } from 'react';
import { BASIC_AUTH } from '../../utils/constants';
import { ExtensionConfig } from '../../types';
import OpenInIcon from '@mui/icons-material/OpenInBrowser';

export const CredentialsForm = (
  extensionConfig: ExtensionConfig,
  setExtensionConfig: Dispatch<SetStateAction<ExtensionConfig>>,
  history: RouteComponentProps['history'],
  isButtonLoading?: boolean
) => {
  const handleCreateFreeAccount = () => {
    history.push('/setupenv');
  };

  return (
    <>
      <Box marginBottom="16px">
        <Stack spacing={2}>
          <Box display="flex" alignItems="center">
            <Typography>{"Don't have a JFrog environment?"}</Typography>
            <Link
              underline="hover"
              fontWeight="700"
              fontFamily={'Open Sans'}
              onClick={isButtonLoading ? undefined : handleCreateFreeAccount}
              sx={{
                marginLeft: '5px',
                cursor: isButtonLoading ? 'default' : 'pointer',
                textDecoration: 'underline',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Create one for FREE
              <OpenInIcon sx={{ marginLeft: '3px', fontSize: '18px' }} />
            </Link>
          </Box>
          <Box>
            JFrog Environment URL
            <TextField
              disabled={isButtonLoading}
              fullWidth
              size="small"
              id="outlined-basic"
              label=""
              variant="outlined"
              value={extensionConfig.url ?? ''}
              placeholder="Example: https://acme.jfrog.io"
              onChange={(e: any) => setExtensionConfig({ ...extensionConfig, url: e.target.value })}
            />
          </Box>
          <>
            <RadioGroup
              aria-disabled
              row
              value={extensionConfig.authType ?? 'basic'}
              defaultValue={extensionConfig.authType}
              name="radio-buttons-group"
            >
              <FormControlLabel
                disabled={isButtonLoading}
                onClick={
                  isButtonLoading
                    ? undefined
                    : (e: any) => setExtensionConfig({ ...extensionConfig, authType: e.target.value })
                }
                value="basic"
                control={<Radio />}
                label="Basic"
              />
              <FormControlLabel
                disabled={isButtonLoading}
                onClick={
                  isButtonLoading
                    ? undefined
                    : (e: any) =>
                        setExtensionConfig({
                          ...extensionConfig,
                          authType: e.target.value,
                        })
                }
                value="accessToken"
                control={<Radio />}
                label="Access Token"
              />
            </RadioGroup>
            {extensionConfig.authType === BASIC_AUTH ? (
              <>
                <Box>
                  Username
                  <TextField
                    disabled={isButtonLoading}
                    fullWidth
                    size="small"
                    key="username"
                    onChange={(e: any) => setExtensionConfig({ ...extensionConfig, username: e.target.value })}
                    label=""
                    defaultValue={extensionConfig.username ?? ''}
                    variant="outlined"
                  />
                </Box>
                <Box>
                  Password
                  <TextField
                    disabled={isButtonLoading}
                    key="password"
                    fullWidth
                    size="small"
                    onChange={(e: any) => setExtensionConfig({ ...extensionConfig, password: e.target.value })}
                    label=""
                    type="password"
                    variant="outlined"
                  />
                </Box>
              </>
            ) : (
              <Box>
                Access Token
                <TextField
                  disabled={isButtonLoading}
                  key="accessToken"
                  fullWidth
                  size="small"
                  label=""
                  type="password"
                  onChange={(e: any) => setExtensionConfig({ ...extensionConfig, accessToken: e.target.value })}
                />
              </Box>
            )}
          </>
        </Stack>
      </Box>
    </>
  );
};

const TextFieldLabel = styled(Box)`
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  color: #556274;
  @media screen and (prefers-color-scheme: dark) {
    color: #f8fafb;
  }
`;
