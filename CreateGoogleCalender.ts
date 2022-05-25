import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'react-bootstrap-v5';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import clsx from 'clsx';
import Counter from '../../../Counter';
import FormErrorMessage from '../../../FormErrorMessage';
import useStateWithHookForm from '../../../../utils/hooks/useStateWithHookForm';
import App from '../../../../interfaces/app.interface';
import Modal from '../../../Modal';
import WithSpinner from '../../../WithSpinner';
import { CreateGoogleCalendarFeedRequest } from '../../../../store/types/apps/googleCalendarFeed';
import Orientation from '../../../../enums/orientation.enum';
import styles from './GoogleCalendar.module.scss';

type CreateGoogleCalendarRequestFormMutated = Omit<
  CreateGoogleCalendarFeedRequest,
  'config' | 'placement'
>;

interface CreateGoogleCalendarFeedRequestFormPayload
  extends CreateGoogleCalendarRequestFormMutated {
  googleCalendarFeedUrl: string;
  refreshRate: number;
}

export interface CreateFeedModalProps {
  onSubmit: (data: CreateGoogleCalendarFeedRequest) => void;
  googleCalendar?: App;
  onClose?: () => void;
  isLoading: boolean;
}

export default ({
  onSubmit,
  onClose,
  isLoading,
  googleCalendar = {} as App,
}: CreateFeedModalProps) => {
  const { t } = useTranslation();
  const [previewDocumentIsFetching, setPreviewDocumentIsFetching] =
    React.useState<boolean>(false);

  const initialValues: CreateGoogleCalendarFeedRequestFormPayload = {
    name: googleCalendar?.name ?? '',
    googleCalendarFeedUrl:
      googleCalendar?.dependency?.config?.googleCalendarFeedUrl ?? '',
    refreshRate:
      googleCalendar?.dependency?.config?.googleCalendarRefreshRateInSeconds ??
      0,
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .matches(/^[a-zA-Z0-9_-\s]+$/, t('common.validation.alphacharacter'))
      .defined(),
    googleCalendarFeedUrl: Yup.string()
      .matches(
        /(calendar.google.com\/calendar)/,
        t('apps.googleCalendar.invalidLink'),
      )
      .url(t('common.validation.validUrl'))
      .defined(),
    refreshRate: Yup.number()
      .min(0, t('common.validation.refreshRate'))
      .defined(),
  }).defined();

  const {
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CreateGoogleCalendarFeedRequestFormPayload>({
    resolver: yupResolver(validationSchema),
    defaultValues: initialValues,
  });

  const modalHeight = 400;

  const [isScheduled, setIsScheduled] = useState<boolean>(false);

  const [feedName, setFeedName] = useStateWithHookForm<
    CreateGoogleCalendarFeedRequestFormPayload,
    string
  >({ setValue, trigger, name: 'name' }, initialValues.name);

  const handleFeedNameChange = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setFeedName(value);
  };

  const [googleCalendarFeedUrl, setgoogleCalendarFeedUrl] =
    useStateWithHookForm<CreateGoogleCalendarFeedRequestFormPayload, string>(
      { setValue, trigger, name: 'googleCalendarFeedUrl' },
      initialValues.googleCalendarFeedUrl,
    );

  const handlePreviewDocumentIsFetching = (
    previewDocumentIsFetchingData: boolean,
  ) => setPreviewDocumentIsFetching(previewDocumentIsFetchingData);

  const handlegoogleCalendarFeedUrlChange = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    handlePreviewDocumentIsFetching(value != null);
    setgoogleCalendarFeedUrl(value);
  };

  const [refreshRate, setRefreshRate] = useStateWithHookForm<
    CreateGoogleCalendarFeedRequestFormPayload,
    number
  >({ setValue, trigger, name: 'refreshRate' }, initialValues.refreshRate);

  const handleRefreshRateChange = (value: number) => {
    setRefreshRate(value);
  };

  const handleOnIFrameLoaded = () => handlePreviewDocumentIsFetching(false);

  const handleOnSubmit = async (
    data: CreateGoogleCalendarFeedRequestFormPayload,
  ) => {
    const {
      name,
      googleCalendarFeedUrl: googleCalendarFeedUrlData,
      refreshRate: refreshRateData,
    } = data;
    const createGoogleCalendarFeedRequest: CreateGoogleCalendarFeedRequest = {
      name,
      isScheduled,
      config: {
        googleCalendarFeedUrl: googleCalendarFeedUrlData,
        googleCalendarRefreshRateInSeconds: refreshRateData,
      },
      zoneId: Orientation.Landscape,
    };

    onSubmit(createGoogleCalendarFeedRequest);
  };

  return (
    <WithSpinner isLoading={isLoading} className="min-h-400px" size="md">
      <div className="container ps-0">
        <form
          onSubmit={handleSubmit(handleOnSubmit)}
          id="form"
          className="d-flex flex-column justify-content-between"
        >
          <div className="d-flex flex-row p-4 w-100">
            <div className="d-flex flex-column mx-2 w-100">
              <label
                htmlFor="name"
                className="required text-dark fw-bolder my-1"
              >
                {t('apps.googleCalendar.googleCalendarTitle')}
              </label>
              <input
                name="name"
                id="name"
                value={feedName}
                onChange={handleFeedNameChange}
                className="form-control form-control-solid"
                placeholder="Type here"
                type="text"
              />
              <FormErrorMessage
                name="name"
                errors={errors}
                className="my-1 px-2"
              />
            </div>

            <div className="d-flex flex-column mx-2 w-100">
              <label
                htmlFor="googleCalendarFeedUrl"
                className="required text-dark fw-bolder my-1"
              >
                {t('apps.googleCalendar.calendarUrl')}
              </label>
              <input
                name="googleCalendarFeedUrl"
                id="googleCalendarFeedUrl"
                value={googleCalendarFeedUrl}
                onChange={handlegoogleCalendarFeedUrlChange}
                className="form-control form-control-solid"
              />
              <FormErrorMessage
                name="googleCalendarFeedUrl"
                errors={errors}
                className="my-1 px-2"
              />
            </div>
          </div>
          <div className="d-flex flex-row px-4 w-100">
            <div className="d-flex flex-column mx-2 w-50">
              <Counter
                name="refreshRate"
                title="Refresh Rate (sec)"
                value={refreshRate}
                onChange={handleRefreshRateChange}
                className="form-control form-control-solid"
                classNameTitle="text-dark fw-bolder my-1"
              />
              <FormErrorMessage
                name="refreshRate"
                errors={errors}
                className="my-1 px-2"
              />
            </div>
          </div>

          <div className="d-flex flex-column   flex-center  p-4 w-100">
            {!errors.googleCalendarFeedUrl && googleCalendarFeedUrl !== '' ? (
              <div className="d-flex flex-column flex-center w-100 h-100">
                {previewDocumentIsFetching ? (
                  <Spinner role="status" animation="border" />
                ) : null}
                <iframe
                  title={feedName}
                  src={googleCalendarFeedUrl}
                  width="100%"
                  height={`${modalHeight}px`}
                  onLoad={handleOnIFrameLoaded}
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  className={styles.htmlIframe}
                />
              </div>
            ) : (
              <div className="d-flex flex-column flex-center w-100">
                <img
                  className="d-flex flex-column align-self-center w-25"
                  alt="No items found"
                  src="/media/illustrations/sketchy-1/5.png"
                />
                <div className="fs-1">{t('apps.googleCalendar.noPreview')}</div>
                <div className="fs-6">
                  {t('apps.googleCalendar.calendarUrl')}
                </div>
              </div>
            )}
          </div>

          <Modal.Separator withoutDefaultMargins className="mt-1 mb-7" />
          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-white text-primary"
              onClick={onClose}
            >
              {t('common.cancel')}
            </button>
            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-primary">
                {t('common.save')}
              </button>
              {!Object.keys(googleCalendar).length && (
                <button
                  onClick={() => setIsScheduled(true)}
                  type="submit"
                  className={clsx('btn btn-primary', styles.scheduleBtn)}
                >
                  {t('common.save_schedule')}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </WithSpinner>
  );
};
