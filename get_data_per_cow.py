#creates a separate CSV for each cow in the dataset, and stores all the csvs in folder fake_cow_data.

import csv

with open('ANSC-CS Data-CalvingPredictionSCR.csv') as csv_file:
    #stores cow_id mapped to a list of each row in the csv that corresponds to it
    result = {}
    readCSV = csv.reader(csv_file, delimiter=',')
    for row in readCSV:
        #this is cow id
        cow_id = row[0]
        #add group if not there
        if not row[28]:
            row[28] = "20"

        if cow_id not in result:
            result[cow_id] = [row]
        else:
            result[cow_id].append(row)
    
    #write each dictionary entry to its own csv
    for key, value in result.items():
        with open('fake_cow_data/' + key + '.csv', mode='w') as csv_file:
            csv_file.write('ID,LACT,Time_Born,AdjTime,N_CALVES,CSEX,NUM_DEAD,AGEFDAT,CINT,GEST,PDIM,DDRY,PDOPN,PREFR,PTOTF,PTOTM,PTOTS,EASE,Time,Raw_Activity_Data,Activity_Change,Activity_Change_by_2_Hours,Rumination_Raw_Data,Weighted_Rumination_Change,Rumination_Deviation_by_2_Hours,Total_Rumination_Minutes_In_Last,Daily_Rumination,Weekly_Rumination_Average,Group,new_health_index,Daily_activity,parity,Day,Period,CalvingYN,newvar,period_to_calving\n')
            for i in range(0, len(value)):
                if i == (len(value) -1):
                    line_as_string = (','.join(value[i]))
                else:
                    line_as_string = (','.join(value[i])) + "\n"
                csv_file.write(line_as_string)
            