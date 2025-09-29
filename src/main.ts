import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(HttpClientModule)
  ],
});
import { 
  addIcons 
} from 'ionicons';
import { 
  createOutline,
  ellipsisVertical,
  eyeOutline,
  trashOutline,
  arrowBackOutline,
  refreshOutline,
  addOutline,
  cubeOutline,
  warningOutline,
  closeCircleOutline,
  cashOutline,
  alertCircle,
  swapVertical,
  flash,
  shieldCheckmark,
  checkmarkCircle,
  timeOutline,
  listOutline,
  settings,
  addCircle,
  closeOutline,
  saveOutline,
  logOutOutline
} from 'ionicons/icons';

// Ajoutez toutes les icônes utilisées
addIcons({
  'create-outline': createOutline,
  'ellipsis-vertical': ellipsisVertical,
  'eye-outline': eyeOutline,
  'trash-outline': trashOutline,
  'arrow-back-outline': arrowBackOutline,
  'refresh-outline': refreshOutline,
  'add-outline': addOutline,
  'cube-outline': cubeOutline,
  'warning-outline': warningOutline,
  'close-circle-outline': closeCircleOutline,
  'cash-outline': cashOutline,
  'alert-circle': alertCircle,
  'swap-vertical': swapVertical,
  'flash': flash,
  'shield-checkmark': shieldCheckmark,
  'checkmark-circle': checkmarkCircle,
  'time-outline': timeOutline,
  'list-outline': listOutline,
  'settings': settings,
  'add-circle': addCircle,
  'close-outline': closeOutline,
  'save-outline': saveOutline,
  'log-out-outline': logOutOutline
});


